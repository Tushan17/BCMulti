codeunit 50000 JsonObject
{
    TableNo = "Main Table";
    trigger OnRun()
    var
        mainTableJsonObject: JsonObject;
    begin
        constructJsonObject(Rec, mainTableJsonObject);
        Message('Here is the json: %1', Format(mainTableJsonObject));

        ProcessResponse(mainTableJsonObject);


    end;


    procedure constructJsonObject(var mainTableRecord: Record "Main Table"; var mainTableJsonObject: JsonObject): Boolean
    var
        myTable: Record "My Table";
        MyTableJsonObject: JsonObject;
        myTableArray: JsonArray;
        error: ErrorInfo;
    begin
        // Clear(mainTableJsonObject);
        // ErrorBehavior::Collect
        error.Collectible(true);


        myTable.Reset();
        myTable.SetRange("Main Table No.", mainTableRecord."No.");
        if myTable.FindSet() then
            repeat
                if constructMyTableArray(myTable, MyTableJsonObject) then
                    myTableArray.Add(MyTableJsonObject);
            until myTable.Next() = 0;

        mainTableJsonObject.Add('No.', mainTableRecord."No.");
        mainTableJsonObject.Add('Name', mainTableRecord.Name);
        mainTableJsonObject.Add('Description', mainTableRecord.Description);
        mainTableJsonObject.Add('Amount', mainTableRecord.Amount);
        mainTableJsonObject.Add('EntryDate', mainTableRecord."Entry Date");
        mainTableJsonObject.Add('MyTableList', myTableArray);

        exit(true);
    end;

    procedure constructMyTableArray(mytable: Record "My Table"; var MyTableJsonObject: JsonObject): Boolean
    var
    begin
        Clear(MyTableJsonObject);
        MyTableJsonObject.Add('No.', mytable."No.");
        MyTableJsonObject.Add('Name', myTable.Name);
        MyTableJsonObject.Add('Description', myTable.Description);
        MyTableJsonObject.Add('Quantity', myTable.Quantity);
        MyTableJsonObject.Add('SystemId', myTable.SystemId);
        MyTableJsonObject.Add('MainTableNo', myTable."Main Table No.");
        exit(true);
    end;

    local procedure ProcessResponse(var mainTableJsonObject: JsonObject)
    var
        mainTable: Record "Main Table";
        errorHandle: ErrorInfo;
        MyTableList: JsonArray;
        MyTableObject: JsonObject;
        MyTableJToken: JsonToken;
        myTable: Record "My Table";
        myTableRecRef: RecordRef;
        MyTableFieldJToken: JsonToken;

    begin
        errorHandle.Collectible(true);

        mainTable.Init();

        mainTable."No." := mainTableJsonObject.GetText('No.');
        mainTable.Name := mainTableJsonObject.GetText('Name');
        mainTable.Description := mainTableJsonObject.GetText('Description');
        mainTable.Amount := mainTableJsonObject.GetDecimal('Amount');
        mainTable."Entry Date" := mainTableJsonObject.GetDate('EntryDate');
        if mainTable.Insert() then
            Message('Main Table record inserted successfully with No. %1', mainTable."No.")
        else
            error('Failed to insert Main Table record with No. %1', mainTable."No.");

        MyTableList := mainTableJsonObject.GetArray('MyTableList');
        foreach MyTableJToken in MyTableList do begin
            MyTableObject := MyTableJToken.AsObject();

            myTableRecRef.Open(Database::"My Table");
            myTableRecRef.Init();
            myTableRecRef.Field(myTable.FieldNo("No.")).Value := MyTableObject.GetText('No.');
            myTableRecRef.Field(myTable.FieldNo(Name)).Value := MyTableObject.GetText('Name');
            myTableRecRef.Field(myTable.FieldNo(Description)).Value := MyTableObject.GetText('Description');
            myTableRecRef.Field(myTable.FieldNo(Quantity)).Value := MyTableObject.GetInteger('Quantity');
            myTableRecRef.Field(myTable.FieldNo(SystemId)).Value := MyTableObject.GetText('SystemId');
            myTableRecRef.Field(myTable.FieldNo("Main Table No.")).Value := MyTableObject.GetText('MainTableNo');

            if myTableRecRef.Insert() then
                Message('My Table record inserted successfully with No. %1', myTableRecRef.Field(myTable.FieldNo("No.")).Value)
            else
                error('Failed to insert My Table record with No. %1', myTableRecRef.Field(myTable.FieldNo("No.")).Value);
            // RecordInsertMyTable(myTable);
        end;

    end;


}