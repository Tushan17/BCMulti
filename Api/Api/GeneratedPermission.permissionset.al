permissionset 50000 GeneratedPermission
{
    Assignable = true;
    Permissions = tabledata "Main Table"=RIMD,
        tabledata "My Table"=RIMD,
        table "Main Table"=X,
        table "My Table"=X,
        codeunit "Camt054 DataExch Setup"=X,
        codeunit JsonObject=X,
        codeunit "My Table Import Mgt."=X,
        codeunit "My Table XML Handler"=X,
        page "Main Table List"=X,
        page "My Table List"=X;
}