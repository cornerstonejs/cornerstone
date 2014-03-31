/**
 * Created by chafey on 3/30/14.
 */
var z = {
    "file-format": {
        "meta-header": {
            "@xfer": "1.2.840.10008.1.2.1", "@name": "Little Endian Explicit", "element": [
                {"@name": "FileMetaInformationGroupLength", "@len": "4", "@vm": "1", "@vr": "UL", "@tag": "0002,0000", "#text": "182"},
                {"@binary": "hidden", "@name": "FileMetaInformationVersion", "@len": "2", "@vm": "1", "@vr": "OB", "@tag": "0002,0001"},
                {"@name": "MediaStorageSOPClassUID", "@len": "28", "@vm": "1", "@vr": "UI", "@tag": "0002,0002", "#text": "1.2.840.10008.5.1.4.1.1.6.1"},
                {"@name": "MediaStorageSOPInstanceUID", "@len": "38", "@vm": "1", "@vr": "UI", "@tag": "0002,0003", "#text": "1.2.840.113857.113857.1918.165944.1.1"},
                {"@name": "TransferSyntaxUID", "@len": "20", "@vm": "1", "@vr": "UI", "@tag": "0002,0010", "#text": "1.2.840.10008.1.2.1"},
                {"@name": "ImplementationClassUID", "@len": "10", "@vm": "1", "@vr": "UI", "@tag": "0002,0012", "#text": "2.16.840.1"},
                {"@name": "ImplementationVersionName", "@len": "14", "@vm": "1", "@vr": "SH", "@tag": "0002,0013", "#text": "MergeCOM3_320"},
                {"@name": "SourceApplicationEntityTitle", "@len": "10", "@vm": "1", "@vr": "AE", "@tag": "0002,0016", "#text": "MANABU_SCP"}
            ]
        },
        "data-set": {
            "@xfer": "1.2.840.10008.1.2.1", "sequence": [
                {"@name": "ReferencedPerformedProcedureStepSequence", "@len": "102", "item": {"@len": "94", "element": [
                    {"@name": "ReferencedSOPClassUID", "@len": "24", "@vm": "1", "@vr": "UI", "@tag": "0008,1150", "#text": "1.2.840.10008.3.1.2.3.3"},
                    {"@name": "ReferencedSOPInstanceUID", "@len": "54", "@vm": "1", "@vr": "UI", "@tag": "0008,1155", "#text": "1.2.840.113663.1500.1.323051616.5.1.20130829.91058.250"}
                ], "@card": "2"}, "@vr": "SQ", "@tag": "0008,1111", "@card": "1"},
                {"@len": "0", "@name": "Unknown Tag & Data", "@vr": "SQ", "@tag": "0029,1014", "@card": "0"},
                {"@name": "RequestAttributesSequence", "@len": "114", "item": {"@len": "106", "element": [
                    {"@name": "RequestedProcedureDescription", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0032,1060", "#text": "US OB 2ND.3RD TRIMESTER"},
                    {"@name": "ScheduledProcedureStepDescription", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0040,0007", "#text": "US OB 2ND.3RD TRIMESTER"},
                    {"@name": "ScheduledProcedureStepID", "@len": "14", "@vm": "1", "@vr": "SH", "@tag": "0040,0009", "#text": "4558274OT1715"},
                    {"@name": "RequestedProcedureID", "@len": "12", "@vm": "1", "@vr": "SH", "@tag": "0040,1001", "#text": "4558274UPUC"}
                ], "@card": "4"}, "@vr": "SQ", "@tag": "0040,0275", "@card": "1"}
            ], "@name": "Little Endian Explicit", "element": [
                {"@name": "SpecificCharacterSet", "@len": "10", "@vm": "1", "@vr": "CS", "@tag": "0008,0005", "#text": "ISO_IR 100"},
                {"@name": "ImageType", "@len": "24", "@vm": "3", "@vr": "CS", "@tag": "0008,0008", "#text": "ORIGINAL\\PRIMARY\\INVALID"},
                {"@name": "InstanceCreationDate", "@len": "8", "@vm": "1", "@vr": "DA", "@tag": "0008,0012", "#text": "20130829"},
                {"@name": "InstanceCreationTime", "@len": "6", "@vm": "1", "@vr": "TM", "@tag": "0008,0013", "#text": "091100"},
                {"@name": "SOPClassUID", "@len": "28", "@vm": "1", "@vr": "UI", "@tag": "0008,0016", "#text": "1.2.840.10008.5.1.4.1.1.6.1"},
                {"@name": "SOPInstanceUID", "@len": "38", "@vm": "1", "@vr": "UI", "@tag": "0008,0018", "#text": "1.2.840.113857.113857.1918.165944.1.1"},
                {"@name": "StudyDate", "@len": "8", "@vm": "1", "@vr": "DA", "@tag": "0008,0020", "#text": "20130918"},
                {"@name": "SeriesDate", "@len": "8", "@vm": "1", "@vr": "DA", "@tag": "0008,0021", "#text": "20130918"},
                {"@name": "ContentDate", "@len": "8", "@vm": "1", "@vr": "DA", "@tag": "0008,0023", "#text": "20130829"},
                {"@name": "AcquisitionDateTime", "@len": "14", "@vm": "1", "@vr": "DT", "@tag": "0008,002a", "#text": "20130829091058"},
                {"@name": "StudyTime", "@len": "4", "@vm": "1", "@vr": "TM", "@tag": "0008,0030", "#text": "1659"},
                {"@name": "SeriesTime", "@len": "6", "@vm": "1", "@vr": "TM", "@tag": "0008,0031", "#text": "091058"},
                {"@name": "ContentTime", "@len": "6", "@vm": "1", "@vr": "TM", "@tag": "0008,0033", "#text": "091100"},
                {"@name": "AccessionNumber", "@len": "6", "@vm": "1", "@vr": "SH", "@tag": "0008,0050", "#text": "667OB1"},
                {"@name": "Modality", "@len": "2", "@vm": "1", "@vr": "CS", "@tag": "0008,0060", "#text": "US"},
                {"@name": "PresentationIntentType", "@len": "16", "@vm": "1", "@vr": "CS", "@tag": "0008,0068", "#text": "FOR PRESENTATION"},
                {"@name": "Manufacturer", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0008,0070", "#text": "Philips Medical Systems"},
                {"@name": "InstitutionName", "@len": "22", "@vm": "1", "@vr": "LO", "@tag": "0008,0080", "#text": "Main Street Radiology"},
                {"@vm": "0", "@name": "StationName", "@vr": "SH", "@tag": "0008,1010", "@len": "0"},
                {"@name": "StudyDescription", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0008,1030", "#text": "US OB 2ND.3RD TRIMESTER"},
                {"@name": "SeriesDescription", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0008,103e", "#text": "US OB 2ND.3RD TRIMESTER"},
                {"@name": "ManufacturerModelName", "@len": "4", "@vm": "1", "@vr": "LO", "@tag": "0008,1090", "#text": "iU22"},
                {"@name": "DerivationDescription", "@len": "2", "@vm": "1", "@vr": "ST", "@tag": "0008,2111", "#text": "0"},
                {"@name": "StartTrim", "@len": "2", "@vm": "1", "@vr": "IS", "@tag": "0008,2142", "#text": "1"},
                {"@name": "StopTrim", "@len": "2", "@vm": "1", "@vr": "IS", "@tag": "0008,2143", "#text": "1"},
                {"@name": "PatientName", "@len": "12", "@vm": "1", "@vr": "PN", "@tag": "0010,0010", "#text": "EATON^ASHLEY"},
                {"@name": "PatientID", "@len": "6", "@vm": "1", "@vr": "LO", "@tag": "0010,0020", "#text": "667890"},
                {"@vm": "0", "@name": "PatientBirthDate", "@vr": "DA", "@tag": "0010,0030", "@len": "0"},
                {"@name": "PatientSex", "@len": "2", "@vm": "1", "@vr": "CS", "@tag": "0010,0040", "#text": "F"},
                {"@name": "PatientAge", "@len": "4", "@vm": "1", "@vr": "AS", "@tag": "0010,1010", "#text": "039Y"},
                {"@name": "DeviceSerialNumber", "@len": "10", "@vm": "1", "@vr": "LO", "@tag": "0018,1000", "#text": "323051616"},
                {"@name": "SoftwareVersions", "@len": "32", "@vm": "1", "@vr": "LO", "@tag": "0018,1020", "#text": "PMS5.1 Ultrasound iU22_6.3.3.145"},
                {"@name": "ProtocolName", "@len": "10", "@vm": "1", "@vr": "LO", "@tag": "0018,1030", "#text": "Free Form"},
                {"@name": "HeartRate", "@len": "2", "@vm": "1", "@vr": "IS", "@tag": "0018,1088", "#text": "0"},
                {"@name": "TransducerData", "@len": "6", "@vm": "3", "@vr": "LO", "@tag": "0018,5010", "#text": "C5_2\\\\"},
                {"@name": "ProcessingFunction", "@len": "12", "@vm": "1", "@vr": "LO", "@tag": "0018,5020", "#text": "ABD_GENERAL"},
                {"@name": "StudyInstanceUID", "@len": "34", "@vm": "1", "@vr": "UI", "@tag": "0020,000d", "#text": "1.2.840.113857.113857.1918.165944"},
                {"@name": "SeriesInstanceUID", "@len": "36", "@vm": "1", "@vr": "UI", "@tag": "0020,000e", "#text": "1.2.840.113857.113857.1918.165944.1"},
                {"@name": "StudyID", "@len": "6", "@vm": "1", "@vr": "SH", "@tag": "0020,0010", "#text": "667OB1"},
                {"@name": "SeriesNumber", "@len": "2", "@vm": "1", "@vr": "IS", "@tag": "0020,0011", "#text": "1"},
                {"@name": "InstanceNumber", "@len": "2", "@vm": "1", "@vr": "IS", "@tag": "0020,0013", "#text": "1"},
                {"@name": "SamplesPerPixel", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0002", "#text": "1"},
                {"@name": "PhotometricInterpretation", "@len": "12", "@vm": "1", "@vr": "CS", "@tag": "0028,0004", "#text": "MONOCHROME2"},
                {"@name": "Rows", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0010", "#text": "768"},
                {"@name": "Columns", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0011", "#text": "1024"},
                {"@name": "UltrasoundColorDataPresent", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0014", "#text": "0"},
                {"@name": "BitsAllocated", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0100", "#text": "8"},
                {"@name": "BitsStored", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0101", "#text": "8"},
                {"@name": "HighBit", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0102", "#text": "7"},
                {"@name": "PixelRepresentation", "@len": "2", "@vm": "1", "@vr": "US", "@tag": "0028,0103", "#text": "0"},
                {"@name": "BurnedInAnnotation", "@len": "4", "@vm": "1", "@vr": "CS", "@tag": "0028,0301", "#text": "YES"},
                {"@name": "WindowCenter", "@len": "4", "@vm": "1", "@vr": "DS", "@tag": "0028,1050", "#text": "127"},
                {"@name": "WindowWidth", "@len": "4", "@vm": "1", "@vr": "DS", "@tag": "0028,1051", "#text": "254"},
                {"@name": "LossyImageCompression", "@len": "2", "@vm": "1", "@vr": "CS", "@tag": "0028,2110", "#text": "00"},
                {"@name": "PrivateCreator", "@len": "18", "@vm": "1", "@vr": "LO", "@tag": "0029,0010", "#text": "ShowcaseAppearance"},
                {"@name": "Unknown Tag & Data", "@len": "8", "@vm": "1", "@vr": "DS", "@tag": "0029,1012", "#text": "1.000000"},
                {"@name": "Unknown Tag & Data", "@len": "4", "@vm": "1", "@vr": "DS", "@tag": "0029,1013", "#text": "100"},
                {"@name": "PerformedProcedureStepStartDate", "@len": "8", "@vm": "1", "@vr": "DA", "@tag": "0040,0244", "#text": "20130829"},
                {"@name": "PerformedProcedureStepStartTime", "@len": "6", "@vm": "1", "@vr": "TM", "@tag": "0040,0245", "#text": "091058"},
                {"@name": "PerformedProcedureStepID", "@len": "16", "@vm": "1", "@vr": "SH", "@tag": "0040,0253", "#text": "20130829.091058"},
                {"@name": "PerformedProcedureStepDescription", "@len": "24", "@vm": "1", "@vr": "LO", "@tag": "0040,0254", "#text": "US OB 2ND.3RD TRIMESTER"},
                {"@name": "CommentsOnThePerformedProcedureStep", "@len": "2", "@vm": "1", "@vr": "ST", "@tag": "0040,0280", "#text": "OB"},
                {"@name": "PresentationLUTShape", "@len": "8", "@vm": "1", "@vr": "CS", "@tag": "2050,0020", "#text": "IDENTITY"},
                {"@binary": "hidden", "@name": "PixelData", "@len": "786432", "@vm": "1", "@vr": "OW", "@tag": "7fe0,0010", "@loaded": "no"}
            ]
        }
    }
}