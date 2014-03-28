//
// This is a very simple DICOM Parser for parsing DICOM Part 10 encoded byte streams
// Functionality Implemented:
//  * DICOM Part10 header verification
//  * Explicit Little Endian Transfer Syntax
//  * Implicit Little Endian Transfer Syntax
//  * Extracting string VR types
//  * Extracting US and UL VR types
//  * Offset of the data for each attribute so the caller can parse the data as it likes
//  * Sequences of known and unknown length with items containing known and unknown lengths
//  TOOD: Look into encapsulated multiframe as I seem to recall some trickerie associated with it
//

(function (cornerstone) {

    function readUint32(dicomFileAsBytes, offset)
    {
        return dicomFileAsBytes[offset]
            + (dicomFileAsBytes[offset+1] << 8)
            + (dicomFileAsBytes[offset + 2] << 16)
            + (dicomFileAsBytes[offset + 3] << 24);
    }

    function readUint16(dicomFileAsBytes, offset)
    {
        return dicomFileAsBytes[offset] + (dicomFileAsBytes[offset+1] << 8);
    }

    function readString(dicomFileAsBytes, offset, length)
    {
        var result = "";
        for(var i=0; i < length; i++)
        {
            var byte = dicomFileAsBytes[offset + i];
            if(byte != 0) {
                result += String.fromCharCode(byte);
            }
        }
        return result;
    }

    function prefixIsInvalid(data) {
        return (
            data[128] !== 68 || // D
            data[129] !== 73 || // I
            data[130] !== 67 || // C
            data[131] !== 77);  // M
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
        else {
            return 2;
        }
    }

    function setLengthAndDataOffsetExplicit(data, offset, attr)
    {
        var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(attr.vr);
        if(dataLengthSizeBytes === 2) {
            attr.length = readUint16(data, offset+6);
            attr.dataOffset = offset + 8;
        } else {
            attr.length = readUint32(data, offset+8);
            attr.dataOffset = offset + 12;
        }
    }

    function setLengthAndDataOffsetImplicit(data, offset, attr)
    {
        attr.length = readUint32(data, offset+4);
        attr.dataOffset = offset + 8;
    }

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

    function parseSQItemUndefinedLength(data, sqItem, offset, explicit)
    {
        // scan up until we find a item delimiter tag
        while(offset < data.length) {
            var group = readUint16(data, offset);
            var element = readUint16(data, offset+2);

            // we hit an item delimeter tag, return the current offset to market
            // the end of this sequence item
            if(group === 0xfffe && element === 0xe00d)
            {
                // NOTE: There should be 0x00000000 following the group/element but there really is no
                // use in checking it - what are we gonna do if it isn't 0:?
                return offset + 8;
            }

            var attr =
            {
                group : group,
                element: element,
                tag : 'x' + ('00000000' + ((group << 16) + element).toString(16)).substr(-8),

                vr : '', // set below if explit
                length: 0, // set below
                dataOffset: 0 // set below
                // properties are added here with the extracted data for the supported VRs
            };

            if(explicit === true) {
                attr.vr = readString(data, offset+4, 2);
                setLengthAndDataOffsetExplicit(data, offset, attr);
                setDataExplicit(data, attr);
            }
            else
            {
                setLengthAndDataOffsetImplicit(data, offset, attr);
                setDataImplicit(data, attr);
            }

            offset = attr.dataOffset + attr.length;
            sqItem[attr.tag] = attr;
        }

        // Buffer overread!  Return current offset so at least they get the data we did read.  Would be nice
        // to indicate the caller this happened though...
        return offset;
    }

    // TODO: Find some data to verify this with
    function parseSQItemKnownLength(data, itemLength, sqItem, offset, explicit)
    {
        // Sanity check the offsets
        if(offset + itemLength > data.length)
        {
            throw "sequence item offsets mismatch";
        }

        // scan up until we find a item delimiter tag
        while(offset < offset + itemLength ) {
            var group = readUint16(data, offset);
            var element = readUint16(data, offset+2);

            var attr =
            {
                group : group,
                element: element,
                tag : 'x' + ('00000000' + ((group << 16) + element).toString(16)).substr(-8),

                vr : '', // set below if explit
                length: 0, // set below
                dataOffset: 0 // set below
                // properties are added here with the extracted data for the supported VRs
            };

            if(explicit === true) {
                attr.vr = readString(data, offset+4, 2);
                setLengthAndDataOffsetExplicit(data, offset, attr);
                setDataExplicit(data, attr);
            }
            else
            {
                setLengthAndDataOffsetImplicit(data, offset, attr);
                setDataImplicit(data, attr);
            }

            offset = attr.dataOffset + attr.length;
            sqItem[attr.tag] = attr;
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    function parseSQElementUndefinedLength(data, attr, explicit)
    {
        attr.items = [];
        var offset = attr.dataOffset;
        while(offset < data.length) {
            var group = readUint16(data, offset);
            var element = readUint16(data, offset+2);
            var itemLength = readUint32(data, offset+4);
            offset += 8;

            if(group === 0xFFFE && element === 0xE0DD) {
                // sequence delimitation item, update attr data length and return
                attr.length = offset - attr.dataOffset;
                return;
            }
            else {

                var sqItem = {};
                attr.items.push(sqItem);

                if(itemLength === -1)
                {
                    offset = parseSQItemUndefinedLength(data, sqItem, offset, explicit);
                } else {
                    parseSQItemKnownLength(data, itemLength, sqItem, offset, explicit);
                    offset += itemLength;
                }
            }
        }

        // Buffer overread!  Return current offset so at least they get the data we did read.  Would be nice
        // to indicate the caller this happened though...
        return offset;
    }

    // TODO: Find some data to verify this with
    function parseSQElementKnownLength(data, attr)
    {
        attr.items = [];
        var offset = attr.dataOffset;
        while(offset < data.dataOffset + data.length) {
            var group = readUint16(data, offset);
            var element = readUint16(data, offset+2);
            var itemLength = readUint32(data, offset+4);
            offset += 8;

            var sqItem = {};
            attr.items.push(sqItem);

            if(itemLength === -1)
            {
                offset = parseSQItemUndefinedLength(data, sqItem, offset, explicit);
            } else {
                parseSQItemKnownLength(data, itemLength, sqItem, offset, explicit);
                offset += itemLength;
            }
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    function setDataExplicit(data, attr)
    {
        if(isStringVr(attr.vr)) {
            attr.str = readString(data, attr.dataOffset, attr.length);
        } else if(attr.vr == 'UL') {
            attr.uint32 = readUint32(data, attr.dataOffset);
        } else if(attr.vr == 'US') {
            attr.uint16 = readUint16(data, attr.dataOffset);
        }
        else if(attr.vr == 'SQ') {
            if(attr.length === -1)
            {
                parseSQElementUndefinedLength(data, attr, true);
            }
            else
            {
                parseSQElementKnownLength(data, attr);
            }
        }
    }

    function setDataImplicit(data, attr)
    {
        // most attributes are strings so assume it is one.  We could be smarter
        // here and use heuristics but that would be almost the same as doing
        // the conversion anyway.  The data offset is included in the attribute
        // so the caller can use a data dictionary if desired
        attr.str = readString(data, attr.dataOffset, attr.length);

        // try to convert into a uint32 or uint16 if the length
        if(attr.length === 4) {
            attr.uint32 = readUint32(data, attr.dataOffset);
        } else if(attr.length === 2) {
            attr.uint16 = readUint16(data, attr.dataOffset);
        }
    }

    function readAttribute(data, offset, explicit)
    {
        var group = readUint16(data, offset);
        var element = readUint16(data, offset+2);

        var attr =
        {
            group : group,
            element: element,
            tag : 'x' + ('00000000' + ((group << 16) + element).toString(16)).substr(-8),

            vr : '', // set below if explit
            length: 0, // set below
            dataOffset: 0 // set below
            // properties are added here with the extracted data for the supported VRs
        };

        if(explicit === true) {
            attr.vr = readString(data, offset+4, 2);
            setLengthAndDataOffsetExplicit(data, offset, attr);
            setDataExplicit(data, attr);
        }
        else
        {
            setLengthAndDataOffsetImplicit(data, offset, attr);
            setDataImplicit(data, attr);
        }

        return attr;
    }

    function isExplicit(dicomFields) {
        var transferSyntax = dicomFields.x00020010.str;
        if(transferSyntax === '1.2.840.10008.1.2')
        {
            return false;
        }
        else if(transferSyntax === '1.2.840.10008.1.2.2')  // explicit big endian  not supported
        {
            return undefined;
        }
        // all other transfer syntaxes should be explicit
        return true;
    }

    //
    // Parses a DICOM Part 10 byte stream and returns a javascript
    // object containing properties for each element found named
    // using its tag.  For example, the Rows attribute 0028,0010 would
    // be named 'x00280010'.  dicomFileAsArrayBuffer is an ArrayBuffer
    // that contains the DICOM Part 10 byte stream
    //
    function parseDicom(dicomPart10AsArrayBuffer)
    {
        var data = new Uint8Array(dicomPart10AsArrayBuffer);

        if(prefixIsInvalid(data)) {
            return undefined;
        }

        var fields = {};

        var offset = 132; // position offset at the first part 10 header attribute

        // read the group length attribute
        var groupLength = readAttribute(data, offset, true);
        offset = groupLength.dataOffset + groupLength.length;

        var offsetOfFirstElementAfterMetaHeader = groupLength.dataOffset + groupLength.uint32 + 4;

        // read part 10 header
        while(offset < offsetOfFirstElementAfterMetaHeader)
        {
            var attr = readAttribute(data, offset, true);
            offset = attr.dataOffset + attr.length;
            fields[attr.tag] = attr;
        }

        // Check to see if this is explicit little endian or explicit little encoding
        // NOT: Big endian is not supported (and not widely used nowadays)
        var explicit = isExplicit(fields);
        if(explicit == undefined)
        {
            return undefined;
        }

        // Now read the rest of the attributes
        while(offset < data.length) {
            var attr = readAttribute(data, offset, explicit);
            offset = attr.dataOffset + attr.length;
            fields[attr.tag] = attr;
        }

        return fields;
    }

    cornerstone.parseDicom = parseDicom;

    return cornerstone;
}(cornerstone));