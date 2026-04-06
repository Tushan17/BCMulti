codeunit 50001 "My Table Import Mgt."
{
    /// <summary>
    /// Entry point for importing My Table records from an XML file.
    /// Uses UploadIntoStream for the file picker (web client compatible) and
    /// delegates XML parsing to codeunit 50002 "My Table XML Handler".
    ///
    /// Expected XML structure:
    ///   <Root>
    ///     <Record>
    ///       <No>REC001</No>
    ///       <Name>Record One</Name>
    ///       <Description>First record</Description>
    ///       <Quantity>5</Quantity>
    ///       <CreatedDate>2026-01-15</CreatedDate>
    ///     </Record>
    ///     ...
    ///   </Root>
    /// </summary>
    procedure ImportXMLFile()
    var
        DataExchDef: Record "Data Exch. Def";
        DataExch: Record "Data Exch.";
        FileInStream: InStream;
        FileOutStream: OutStream;
        FileName: Text;
        HandlerCodeunitId: Integer;
    begin
        EnsureDataExchDef();

        // Read the handler codeunit from the definition – abort if not configured.
        DataExchDef.Get(DataExchDefCode());
        HandlerCodeunitId := DataExchDef."Reading/Writing Codeunit";
        // if HandlerCodeunitId = 0 then
        //     DataExchDef.TestField("Reading/Writing Codeunit", Codeunit::"My Table XML Handler");
        // File picker runs BEFORE any database writes – avoids open-transaction conflicts.
        FileName := '';
        if not UploadIntoStream('Select XML File to Import', '', 'XML Files (*.xml)|*.xml', FileName, FileInStream) then
            exit; // user cancelled

        // Now that we have the file, create the DataExch record and store the content.
        DataExch.Init();
        DataExch."Data Exch. Def Code" := DataExchDefCode();
        DataExch."Data Exch. Line Def Code" := LineDefCode();
        DataExch."File Name" := CopyStr(FileName, 1, 250);
        DataExch.Insert(true);

        DataExch."File Content".CreateOutStream(FileOutStream, TextEncoding::UTF8);
        CopyStream(FileOutStream, FileInStream);
        DataExch.Modify(true);

        Commit();

        // Run whichever codeunit is configured in the definition – not hard-coded.
        if not Codeunit.Run(Codeunit::"My Table XML Handler", DataExch) then begin
            DataExch.Delete(true);
            Error(GetLastErrorText());
        end;

        DataExch.Delete(true);
        Message('XML import completed successfully.');
    end;

    local procedure DataExchDefCode(): Code[20]
    begin
        exit('MYTBL-XML');
    end;

    local procedure LineDefCode(): Code[20]
    begin
        exit('DEFAULT');
    end;

    local procedure EnsureDataExchDef()
    var
        DataExchDef: Record "Data Exch. Def";
    begin
        if not DataExchDef.Get(DataExchDefCode()) then begin
            CreateDataExchDef();
            exit;
        end;

        // Repair an existing definition whose handler codeunit was not set.
        if DataExchDef."Ext. Data Handling Codeunit" = 0 then begin
            DataExchDef."Ext. Data Handling Codeunit" := Codeunit::"My Table XML Handler";
            DataExchDef.Modify(true);
        end;
    end;

    local procedure CreateDataExchDef()
    var
        DataExchDef: Record "Data Exch. Def";
        DataExchLineDef: Record "Data Exch. Line Def";
    begin
        // --- Data Exchange Definition header ---
        DataExchDef.Init();
        DataExchDef.Code := DataExchDefCode();
        DataExchDef.Name := 'My Table XML Import';
        DataExchDef.Type := DataExchDef.Type::"Generic Import";
        DataExchDef."File Type" := DataExchDef."File Type"::Xml;
        DataExchDef."Ext. Data Handling Codeunit" := Codeunit::"My Table XML Handler";
        DataExchDef.Insert(true);

        // --- Line definition (one entry per <Record> node) ---
        DataExchLineDef.Init();
        DataExchLineDef."Data Exch. Def Code" := DataExchDefCode();
        DataExchLineDef.Code := LineDefCode();
        DataExchLineDef.Name := 'My Table Record';
        DataExchLineDef."Data Line Tag" := '/Root/Record';
        DataExchLineDef.Insert(true);

        // --- Column definitions with XPath per field ---
        InsertColumnDef(1, 'No', '/Root/Record/No');
        InsertColumnDef(2, 'Name', '/Root/Record/Name');
        InsertColumnDef(3, 'Description', '/Root/Record/Description');
        InsertColumnDef(4, 'Quantity', '/Root/Record/Quantity');
        InsertColumnDef(5, 'CreatedDate', '/Root/Record/CreatedDate');

        // --- Mapping: Data Exch. columns → My Table fields ---
        InsertDataExchMapping();
        InsertFieldMapping(1, 1);  // Column No → Field "No."
        InsertFieldMapping(2, 2);  // Column Name → Field Name
        InsertFieldMapping(3, 3);  // Column Description → Field Description
        InsertFieldMapping(4, 4);  // Column Quantity → Field Quantity
        InsertFieldMapping(5, 5);  // Column CreatedDate → Field "Created Date"
    end;

    local procedure InsertColumnDef(ColNo: Integer; ColName: Text[250]; XPath: Text[250])
    var
        DataExchColDef: Record "Data Exch. Column Def";
    begin
        DataExchColDef.Init();
        DataExchColDef."Data Exch. Def Code" := DataExchDefCode();
        DataExchColDef."Data Exch. Line Def Code" := LineDefCode();
        DataExchColDef."Column No." := ColNo;
        DataExchColDef.Name := ColName;
        DataExchColDef.Path := XPath;
        DataExchColDef.Insert(true);
    end;

    local procedure InsertDataExchMapping()
    var
        DataExchMapping: Record "Data Exch. Mapping";
    begin
        DataExchMapping.Init();
        DataExchMapping."Data Exch. Def Code" := DataExchDefCode();
        DataExchMapping."Data Exch. Line Def Code" := LineDefCode();
        DataExchMapping."Table ID" := Database::"My Table";
        DataExchMapping.Name := 'My Table';
        DataExchMapping.Insert(true);
    end;

    local procedure InsertFieldMapping(ColNo: Integer; FieldID: Integer)
    var
        DataExchFieldMapping: Record "Data Exch. Field Mapping";
    begin
        DataExchFieldMapping.Init();
        DataExchFieldMapping."Data Exch. Def Code" := DataExchDefCode();
        DataExchFieldMapping."Data Exch. Line Def Code" := LineDefCode();
        DataExchFieldMapping."Table ID" := Database::"My Table";
        DataExchFieldMapping."Column No." := ColNo;
        DataExchFieldMapping."Field ID" := FieldID;
        DataExchFieldMapping.Insert(true);
    end;
}
