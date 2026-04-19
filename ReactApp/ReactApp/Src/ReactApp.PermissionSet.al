/// <summary>
/// ReactApp – full read/write permission set.
/// Grants RIMD on the React Demo Record table and allows access to the
/// React Demo List and React Demo Card pages.
/// </summary>
permissionset 51000 "ReactApp - Full"
{
    Assignable = true;
    Caption    = 'ReactApp - Full';

    Permissions =
        tabledata "React Demo Record" = RIMD,
        table "React Demo Record" = X,
        page "React Demo List" = X,
        page "React Demo Card" = X;
}
