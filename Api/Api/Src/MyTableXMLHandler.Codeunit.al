codeunit 50002 "My Table XML Handler"
{
    TableNo = "Data Exch.";

    // Step 1 – Parse the XML and stage every value into Data Exch. Field.
    // Step 2 – Call ProcessMapping, which reads Data Exch. Field Mapping (MYTBL-XML)
    //           at runtime and applies values to My Table via RecordRef/FieldRef.
    //           No field is hard-coded here; the definition drives everything.
    trigger OnRun()
    var
        DataExchLineDef: Record "Data Exch. Line Def";
        TempBlob: Codeunit "Temp Blob";
        RecRef: RecordRef;
        FileInStream: InStream;
        XmlDoc: XmlDocument;
        XmlNodeList: XmlNodeList;
        XmlNode: XmlNode;
        LineNo: Integer;
        DataLineTag: Text;
    begin
        RecRef.GetTable(Rec);
        TempBlob.FromRecordRef(RecRef, Rec.FieldNo("File Content"));

        if not TempBlob.HasValue() then
            Error('No file content found in the Data Exchange record.');

        TempBlob.CreateInStream(FileInStream, TextEncoding::UTF8);

        if not XmlDocument.ReadFrom(FileInStream, XmlDoc) then
            Error('The selected file is not a valid XML document.');

        // Read the XPath from Data Exch. Line Def."Data Line Tag" – not hard-coded.
        DataExchLineDef.Get(Rec."Data Exch. Def Code", Rec."Data Exch. Line Def Code");
        DataLineTag := DataExchLineDef."Data Line Tag";
        if DataLineTag = '' then
            Error('The Data Exchange Line Definition ''%1'' has no Data Line Tag configured.', Rec."Data Exch. Line Def Code");

        if not XmlDoc.SelectNodes(DataLineTag, XmlNodeList) then
            Error('No elements found using the XPath ''%1'' in the XML file.', DataLineTag);

        if XmlNodeList.Count() = 0 then
            Error('The XML file contains no records matching XPath ''%1''.', DataLineTag);

        LineNo := 1;
        foreach XmlNode in XmlNodeList do begin
            StageFieldValues(Rec, XmlNode, LineNo);
            LineNo += 1;
        end;

        // Apply staged values to My Table using the field mappings in MYTBL-XML.
        ProcessMapping(Rec);
    end;

    // Reads Data Exch. Field Mapping for the definition and applies every staged
    // Data Exch. Field value to the correct My Table field via RecordRef/FieldRef.
    local procedure ProcessMapping(var DataExch: Record "Data Exch.")
    var
        DataExchField: Record "Data Exch. Field";
        DataExchField2: Record "Data Exch. Field";
        DataExchFieldMapping: Record "Data Exch. Field Mapping";
        TargetRecRef: RecordRef;
        FldRef: FieldRef;
        CurrentLineNo: Integer;
    begin
        // Iterate distinct line numbers via the PK column (column 1 = No.)
        DataExchField.SetRange("Data Exch. No.", DataExch."Entry No.");
        DataExchField.SetRange("Data Exch. Line Def Code", DataExch."Data Exch. Line Def Code");
        DataExchField.SetRange("Column No.", 1);
        if not DataExchField.FindSet() then
            exit;

        // Pre-fetch the field mappings once (same for every line)
        DataExchFieldMapping.SetRange("Data Exch. Def Code", DataExch."Data Exch. Def Code");
        DataExchFieldMapping.SetRange("Data Exch. Line Def Code", DataExch."Data Exch. Line Def Code");
        DataExchFieldMapping.SetRange("Table ID", Database::"My Table");

        repeat
            CurrentLineNo := DataExchField."Line No.";
            if OpenTargetRecord(TargetRecRef, DataExchField.Value) then begin
                // Apply each mapped column to its target field
                if DataExchFieldMapping.FindSet() then
                    repeat
                        DataExchField2.SetRange("Data Exch. No.", DataExch."Entry No.");
                        DataExchField2.SetRange("Data Exch. Line Def Code", DataExch."Data Exch. Line Def Code");
                        DataExchField2.SetRange("Line No.", CurrentLineNo);
                        DataExchField2.SetRange("Column No.", DataExchFieldMapping."Column No.");
                        if DataExchField2.FindFirst() then begin
                            FldRef := TargetRecRef.Field(DataExchFieldMapping."Field ID");
                            ApplyFieldValue(FldRef, DataExchField2.Value);
                        end;
                    until DataExchFieldMapping.Next() = 0;

                TargetRecRef.Modify(true);
                TargetRecRef.Close();
            end;
        until DataExchField.Next() = 0;
    end;

    // Finds an existing My Table record by No., or inserts a new one.
    // Returns false if NoValue is blank (skip the line).
    local procedure OpenTargetRecord(var TargetRecRef: RecordRef; NoValue: Text): Boolean
    var
        MyTable: Record "My Table";
        NoCode: Code[20];
    begin
        NoCode := CopyStr(NoValue, 1, MaxStrLen(NoCode));
        if NoCode = '' then
            exit(false);

        if not MyTable.Get(NoCode) then begin
            MyTable.Init();
            MyTable."No." := NoCode;
            MyTable.Insert(true);
        end;

        TargetRecRef.GetTable(MyTable);
        exit(true);
    end;

    // Converts TextValue to the native type of FldRef before validating.
    // FieldRef.Validate(Text) works for Text/Code fields but throws a runtime
    // conversion error for Date, Integer, Decimal, and Boolean fields.
    local procedure ApplyFieldValue(var FldRef: FieldRef; TextValue: Text)
    var
        DateValue: Date;
        IntValue: Integer;
        DecValue: Decimal;
        BoolValue: Boolean;
    begin
        case FldRef.Type of
            FieldType::Date:
                begin
                    if TextValue = '' then
                        FldRef.Validate(0D)
                    else begin
                        // Format 9 = ISO 8601 (YYYY-MM-DD)
                        Evaluate(DateValue, TextValue, 9);
                        FldRef.Validate(DateValue);
                    end;
                end;
            FieldType::Integer, FieldType::Option:
                begin
                    Evaluate(IntValue, TextValue);
                    FldRef.Validate(IntValue);
                end;
            FieldType::Decimal:
                begin
                    Evaluate(DecValue, TextValue);
                    FldRef.Validate(DecValue);
                end;
            FieldType::Boolean:
                begin
                    Evaluate(BoolValue, TextValue);
                    FldRef.Validate(BoolValue);
                end;
            else
                // Text, Code, and all other types accept a plain text validate
                FldRef.Validate(TextValue);
        end;
    end;

    // Reads Data Exch. Column Def for MYTBL-XML at runtime.
    // Each column def carries a Path (e.g. /Root/Record/No). The last segment
    // is used as the element name to select from the current <Record> node.
    // No column number or element name is hard-coded here.
    local procedure StageFieldValues(var DataExch: Record "Data Exch."; RecordNode: XmlNode; LineNo: Integer)
    var
        DataExchColDef: Record "Data Exch. Column Def";
        ElementName: Text;
        NodeValue: Text;
    begin
        DataExchColDef.SetRange("Data Exch. Def Code", DataExch."Data Exch. Def Code");
        DataExchColDef.SetRange("Data Exch. Line Def Code", DataExch."Data Exch. Line Def Code");
        if not DataExchColDef.FindSet() then
            exit;

        repeat
            // Derive the relative element name from the stored XPath:
            // e.g. '/Root/Record/CreatedDate'  →  'CreatedDate'
            ElementName := DataExchColDef.Path;
            while StrPos(ElementName, '/') > 0 do
                ElementName := CopyStr(ElementName, StrPos(ElementName, '/') + 1);

            NodeValue := GetNodeText(RecordNode, ElementName);
            InsertField(DataExch, LineNo, DataExchColDef."Column No.", NodeValue);
        until DataExchColDef.Next() = 0;
    end;

    local procedure InsertField(var DataExch: Record "Data Exch."; LineNo: Integer; ColNo: Integer; NodeValue: Text)
    var
        DataExchField: Record "Data Exch. Field";
    begin
        DataExchField.Init();
        DataExchField."Data Exch. No." := DataExch."Entry No.";
        DataExchField."Line No." := LineNo;
        DataExchField."Column No." := ColNo;
        DataExchField."Data Exch. Line Def Code" := DataExch."Data Exch. Line Def Code";
        DataExchField.Value := CopyStr(NodeValue, 1, MaxStrLen(DataExchField.Value));
        DataExchField.Insert(true);
    end;

    local procedure GetNodeText(ParentNode: XmlNode; ElementName: Text): Text
    var
        ChildNode: XmlNode;
        XmlElem: XmlElement;
    begin
        if ParentNode.SelectSingleNode(ElementName, ChildNode) then begin
            XmlElem := ChildNode.AsXmlElement();
            exit(XmlElem.InnerText());
        end;
        exit('');
    end;
}
