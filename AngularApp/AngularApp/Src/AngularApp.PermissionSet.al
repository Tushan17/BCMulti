/// <summary>
/// AngularApp – full read/write permission set.
/// Grants RIMD on the Angular Demo Record table and allows access to the
/// Angular Demo List and Angular Demo Card pages.
/// </summary>
permissionset 51501 "AngularApp - All Objects"
{
    Assignable = true;
    Caption    = 'AngularApp – All Objects';

    Permissions =
        tabledata "Angular Demo Record" = RIMD,
        table "Angular Demo Record" = X,
        page "Angular Demo List" = X,
        page "Angular Demo Card" = X;
}
