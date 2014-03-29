//
// This is a very simple DICOM Parser for parsing DICOM Part 10 encoded byte streams
// Functionality Implemented:
//  * DICOM Part10 header verification
//  * Explicit Little Endian Transfer Syntax (and the other compression syntaxes that encode in explicit little endian)
//  * Implicit Little Endian Transfer Syntax
//  * Extracting string VR types
//  * Extracting US and UL VR types
//  * Offset of the data for each attribute so the caller can parse the data as it likes
//  * Sequences of known and unknown length with items containing known and unknown lengths
//  TOOD: Look into encapsulated multiframe as I seem to recall some trickerie associated with it
// Not supported:
//  Big Endian transfer syntaxes
//

(function (cornerstone)
{

    ////////// begin data buffer parser helpers ////////

    function readUint32(data, offset)
    {
        return data[offset]
            + (data[offset+1] << 8)
            + (data[offset + 2] << 16)
            + (data[offset + 3] << 24);
    }

    function readUint16(data, offset)
    {
        return data[offset] + (data[offset+1] << 8);
    }

    function readString(data, offset, length)
    {
        var result = "";
        for(var i=0; i < length; i++)
        {
            var byte = data[offset + i];
            if(byte != 0)
            {
                result += String.fromCharCode(byte);
            }
        }
        return result;
    }

    ////////// end data buffer parser helpers ////////




    ////////// begin sequence item parsing ////////

    function parseSQItemUndefinedLength(data, offset, sqItem, explicit)
    {
        // scan up until we find a item delimiter tag
        while(offset < data.length)
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            sqItem[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.groupNumber === 0xfffe && element.elementNumber === 0xe00d)
            {
                // NOTE: There should be 0x00000000 following the group/element but there really is no
                // use in checking it - what are we gonna do if it isn't 0:?
                return offset;
            }
        }

        // Buffer overread!  Return current offset so at least they get the data we did read.  Would be nice
        // to indicate the caller this happened though...
        return offset;
    }

    // TODO: Find some data to verify this with
    function parseSQItemKnownLength(data, offset, itemLength, sqItem, explicit)
    {
        // Sanity check the offsets
        if(offset + itemLength > data.length)
        {
            throw "sequence item offsets mismatch";
        }

        // scan up until we find a item delimiter tag
        while(offset < offset + itemLength )
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            sqItem[element.tag] = element;
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    function readSequenceItem(data, offset, explicit)
    {
        var groupNumber = readUint16(data, offset);
        var elementNumber = readUint16(data, offset+2);
        var itemLength = readUint32(data, offset+4);
        offset += 8;

        var item =
        {
            groupNumber: groupNumber,
            elementNumber: elementNumber,
            elements : {},
            length: itemLength,
            dataOffset: offset
        };

        if(itemLength === -1)
        {
            offset = parseSQItemUndefinedLength(data, offset, item, explicit);
            item.length = offset - item.dataOffset;
        }
        else
        {
            parseSQItemKnownLength(data, offset, itemLength, item, explicit);
        }
        return item;
    }

    ////////// end sequence item parsing ////////




    ////////// begin sequence element parsing ////////

    function parseSQElementUndefinedLength(data, element, explicit)
    {
        element.items = [];
        var offset = element.dataOffset;
        while(offset < data.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);

            // If this is the sequence delimitiation item, return the offset of the next element
            if(item.groupNumber === 0xFFFE && item.elementNumber === 0xE0DD)
            {
                // sequence delimitation item, update attr data length and return
                element.length = offset - element.dataOffset;
                return offset;
            }
        }

        // Buffer overread!  Set the length of the element to reflect the end of buffer so
        // the caller has access to what we were able to parse.
        // TODO: Figure out how to communicate parse errors like this to the caller
        element.length = offset - element.dataOffset;
    }

    // TODO: Find some data to verify this with
    function parseSQElementKnownLength(data, element, explicit)
    {
        element.items = [];
        var offset = element.dataOffset;
        while(offset < element.dataOffset + element.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    ////////// endsequence element parsing ////////



    ////// begin element parsing /////

    function isStringVr(vr)
    {
        if(vr === 'AT'
            || vr === 'FL'
            || vr === 'FD'
            || vr === 'OB'
            || vr === 'OF'
            || vr === 'OW'
            || vr === 'SI'
            || vr === 'SQ'
            || vr === 'SS'
            || vr === 'UL'
            || vr === 'US'
            )
        {
            return false;
        }
        return true;
    }

    // this function converts the data associated with the element
    // into the right type based on the VR and adds it to the element
    function setDataExplicit(data, element)
    {
        // TODO: add conversions for the other VR's
        if(isStringVr(element.vr))
        {
            element.str = readString(data, element.dataOffset, element.length);
        }
        else if(element.vr == 'UL')
        {
            element.uint32 = readUint32(data, element.dataOffset);
        }
        else if(element.vr == 'US')
        {
            element.uint16 = readUint16(data, element.dataOffset);
        }
        else if(element.vr == 'SQ')  // TODO: UN, OB, OW
        {
            if(element.length === -1)
            {
                parseSQElementUndefinedLength(data, element, true);
            }
            else
            {
                parseSQElementKnownLength(data, element, true);
            }
        }
    }

    function setDataImplicit(data, element)
    {
        // Here we add the most common VR's to the attribute.  This is not
        // perfect but it is cheap, fast, simple and allows more correct
        // data casting to happen at a higher level with a data dictionary if desired.
        // We do capture the offset of the data in the attribute to support this
        // when it is needed.

        // most attributes are strings so assume it is one.  We could be smarter
        // here and use heuristics but the cost to actually create a string is
        // almost the same so why bother.
        element.str = readString(data, element.dataOffset, element.length);

        // provide uint32 and uint16 data if the length is right for
        // those data types.  This obviously won't be meaningful
        // in all cases (e.g. a string could be 4 bytes long)
        if(element.length === 4)
        {
            element.uint32 = readUint32(data, element.dataOffset);
        }
        else if(attr.length === 2)
        {
            element.uint16 = readUint16(data, element.dataOffset);
        }
    }

    function getDataLengthSizeInBytesForVR(vr)
    {
        if(vr === 'OB'
            || vr === 'OW'
            || vr === 'SQ'
            || vr === 'OF'
            || vr === 'UT'
            || vr === 'UN')
        {
            return 4;
        }
        else
        {
            return 2;
        }
    }

    function setLengthAndDataOffsetExplicit(data, offset, element)
    {
        var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);
        if(dataLengthSizeBytes === 2)
        {
            element.length = readUint16(data, offset+6);
            element.dataOffset = offset + 8;
        }
        else
        {
            element.length = readUint32(data, offset+8);
            element.dataOffset = offset + 12;
        }
    }

    function setLengthAndDataOffsetImplicit(data, offset, element)
    {
        element.length = readUint32(data, offset+4);
        element.dataOffset = offset + 8;
    }

    function readElement(data, offset, explicit)
    {
        var groupNumber = readUint16(data, offset);
        var elementNumber = readUint16(data, offset+2);
        var tag = ('00000000' + ((groupNumber << 16) + elementNumber).toString(16)).substr(-8);
        var element =
        {
            groupNumber : groupNumber,
            elementNumber: elementNumber,
            tag : 'x' + tag

            //vr : '', // set below if explicit
            //length: 0, // set below
            //dataOffset: 0 // set below
        };

        if(explicit === true)
        {
            element.vr = readString(data, offset+4, 2);
            setLengthAndDataOffsetExplicit(data, offset, element);
            setDataExplicit(data, element);
        }
        else
        {
            setLengthAndDataOffsetImplicit(data, offset, element);
            setDataImplicit(data, element);
        }

        return element;
    }

    ////// end element parsing /////

    function isExplicit(dicomP10HeaderElements) {
        var transferSyntax = dicomP10HeaderElements.x00020010.str;
        if(transferSyntax === '1.2.840.10008.1.2')
        {
            return false;
        }
        else if(transferSyntax === '1.2.840.10008.1.2.2')  // explicit big endian is not supported
        {
            return undefined;
        }
        // all other transfer syntaxes should be explicit
        return true;
    }

    function prefixIsInvalid(data)
    {
        return (data[128] !== 68 || // D
                data[129] !== 73 || // I
                data[130] !== 67 || // C
                data[131] !== 77);  // M
    }

    //
    // Parses a DICOM Part 10 byte stream and returns a javascript
    // object containing properties for each element found named
    // using its tag.  For example, the Rows element 0028,0010 would
    // be named 'x00280010'.  dicomFileAsArrayBuffer is an ArrayBuffer
    // that contains the DICOM Part 10 byte stream
    //
    function parseDicom(dicomPart10AsArrayBuffer)
    {
        var data = new Uint8Array(dicomPart10AsArrayBuffer);

        // Make sure we have a DICOM P10 File
        if(prefixIsInvalid(data))
        {
            return undefined;
        }

        var elements = {}; // the is what we return to the caller populated with parsed elements

        var offset = 132; // position offset at the first part 10 header attribute

        // read the group length element
        var groupLengthElement = readElement(data, offset, true);
        offset = groupLengthElement.dataOffset + groupLengthElement.length;
        elements[groupLengthElement.tag] = groupLengthElement;

        // read part 10 header
        var offsetOfFirstElementAfterMetaHeader = offset + groupLengthElement.uint32;
        while(offset < offsetOfFirstElementAfterMetaHeader)
        {
            var element = readElement(data, offset, true);
            offset = element.dataOffset + element.length;
            elements[element.tag] = element;
        }

        // Check to see if this is explicit little endian or implicit little endian encoding
        // NOTE: Big endian is not supported
        var explicit = isExplicit(elements);
        if(explicit === undefined)
        {
            return undefined; // big endian, cannot parse
        }

        // Now read the rest of the elements
        while(offset < data.length)
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            elements[element.tag] = element;
        }

        return elements;
    }

    cornerstone.parseDicom = parseDicom;

    return cornerstone;
}(cornerstone));