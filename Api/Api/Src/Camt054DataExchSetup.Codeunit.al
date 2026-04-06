codeunit 50003 "Camt054 DataExch Setup"
{
    /// <summary>
    /// Creates (or repairs) the Data Exchange Definition for ISO 20022
    /// camt.054.001.08 – Bank-to-Customer Debit/Credit Notification.
    ///
    /// Def code  : CAMT054-08
    /// Line def  : NTRY  (one row per <Ntry> element)
    /// Data tag  : /Document/BkToCstmrDbtCdtNtfctn/Ntfctn/Ntry
    ///
    /// Column map (18 columns, all XPaths absolute so any handler can use
    /// XmlDocument.SelectSingleNode directly):
    ///  1  NtryRef          – Entry Reference
    ///  2  Amt              – Amount (Decimal)
    ///  3  CdtDbtInd        – Credit / Debit Indicator
    ///  4  RvslInd          – Reversal Indicator
    ///  5  Sts              – Entry Status Code
    ///  6  BookgDt          – Booking Date (ISO date)
    ///  7  ValDt            – Value Date (ISO date)
    ///  8  AcctSvcrRef      – Account Servicer Reference (entry level)
    ///  9  BkTxCdDomn       – Bank Tx Code – Domain
    /// 10  BkTxCdFmly       – Bank Tx Code – Family
    /// 11  BkTxCdSubFmly    – Bank Tx Code – Sub-family
    /// 12  BkTxCdPrtry      – Bank Tx Code – Proprietary
    /// 13  EndToEndId       – End-to-End Identification
    /// 14  MndtId           – Mandate Identification
    /// 15  InstrId          – Instruction Identification
    /// 16  TxAcctSvcrRef    – Transaction Account Servicer Reference
    /// 17  RmtInfUstrd      – Remittance Info (Unstructured)
    /// 18  CdtrRef          – Creditor Reference (Structured)
    ///     + AddtlNtryInf   – Additional Entry Information (col 19)
    /// </summary>
    procedure CreateOrUpdateDataExchDef()
    var
        DataExchDef: Record "Data Exch. Def";
    begin
        if not DataExchDef.Get(DefCode()) then
            InsertDataExchDef()
        else
            RepairDataExchDef(DataExchDef);

        EnsureLineDef();
        EnsureColumnDefs();
    end;

    // -------------------------------------------------------------------------
    // Public helpers
    // -------------------------------------------------------------------------
    procedure DefCode(): Code[20]
    begin
        exit('CAMT054-08');
    end;

    procedure LineDefCode(): Code[20]
    begin
        exit('NTRY');
    end;

    // -------------------------------------------------------------------------
    // Definition header
    // -------------------------------------------------------------------------
    local procedure InsertDataExchDef()
    var
        DataExchDef: Record "Data Exch. Def";
    begin
        DataExchDef.Init();
        DataExchDef.Code := DefCode();
        DataExchDef.Name := 'camt.054.001.08 – Bank Notification';
        DataExchDef.Type := DataExchDef.Type::"Bank Statement Import";
        DataExchDef."File Type" := DataExchDef."File Type"::Xml;
        DataExchDef."File Encoding" := DataExchDef."File Encoding"::"UTF-8";
        DataExchDef."Reading/Writing XMLport" := 0;
        DataExchDef."Reading/Writing Codeunit" := Codeunit::"My Table XML Handler";
        DataExchDef.Insert(true);
    end;

    local procedure RepairDataExchDef(var DataExchDef: Record "Data Exch. Def")
    var
        Modified: Boolean;
    begin
        if DataExchDef.Type <> DataExchDef.Type::"Bank Statement Import" then begin
            DataExchDef.Type := DataExchDef.Type::"Bank Statement Import";
            Modified := true;
        end;
        if DataExchDef."File Type" <> DataExchDef."File Type"::Xml then begin
            DataExchDef."File Type" := DataExchDef."File Type"::Xml;
            Modified := true;
        end;
        if DataExchDef."Reading/Writing Codeunit" <> Codeunit::"My Table XML Handler" then begin
            DataExchDef."Reading/Writing Codeunit" := Codeunit::"My Table XML Handler";
            Modified := true;
        end;
        if Modified then
            DataExchDef.Modify(true);
    end;

    // -------------------------------------------------------------------------
    // Line definition
    // -------------------------------------------------------------------------
    local procedure EnsureLineDef()
    var
        DataExchLineDef: Record "Data Exch. Line Def";
        Modified: Boolean;
    begin
        if not DataExchLineDef.Get(DefCode(), LineDefCode()) then begin
            DataExchLineDef.Init();
            DataExchLineDef."Data Exch. Def Code" := DefCode();
            DataExchLineDef.Code := LineDefCode();
            DataExchLineDef.Name := 'camt.054 Entry (Ntry)';
            DataExchLineDef."Data Line Tag" := '/Document/BkToCstmrDbtCdtNtfctn/Ntfctn/Ntry';
            DataExchLineDef.Namespace := 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08';
            DataExchLineDef.Insert(true);
            exit;
        end;

        // Repair an existing line def that is missing the XML namespace.
        if DataExchLineDef.Namespace <> 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08' then begin
            DataExchLineDef.Namespace := 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08';
            Modified := true;
        end;
        if Modified then
            DataExchLineDef.Modify(true);
    end;

    // -------------------------------------------------------------------------
    // Column definitions – full absolute XPaths from the XSD
    // -------------------------------------------------------------------------
    local procedure EnsureColumnDefs()
    var
        Base: Text;
    begin
        Base := '/Document/BkToCstmrDbtCdtNtfctn/Ntfctn/Ntry';

        // Entry-level fields
        UpsertColDef(1, 'NtryRef', 'Entry Reference', Base + '/NtryRef', false);
        UpsertColDef(2, 'Amt', 'Amount', Base + '/Amt', false);
        UpsertColDef(3, 'CdtDbtInd', 'Credit/Debit Indicator', Base + '/CdtDbtInd', false);
        UpsertColDef(4, 'RvslInd', 'Reversal Indicator', Base + '/RvslInd', false);
        UpsertColDef(5, 'Sts', 'Entry Status', Base + '/Sts/Cd', false);
        UpsertColDef(6, 'BookgDt', 'Booking Date', Base + '/BookgDt/Dt', false);
        UpsertColDef(7, 'ValDt', 'Value Date', Base + '/ValDt/Dt', false);
        UpsertColDef(8, 'AcctSvcrRef', 'Account Servicer Reference', Base + '/AcctSvcrRef', false);
        UpsertColDef(9, 'AddtlNtryInf', 'Additional Entry Information', Base + '/AddtlNtryInf', false);

        // Bank Transaction Code
        UpsertColDef(10, 'BkTxCdDomn', 'BkTxCd – Domain Code', Base + '/BkTxCd/Domn/Cd', false);
        UpsertColDef(11, 'BkTxCdFmly', 'BkTxCd – Family Code', Base + '/BkTxCd/Domn/Fmly/Cd', false);
        UpsertColDef(12, 'BkTxCdSubFmly', 'BkTxCd – Sub-family Code', Base + '/BkTxCd/Domn/Fmly/SubFmlyCd', false);
        UpsertColDef(13, 'BkTxCdPrtry', 'BkTxCd – Proprietary Code', Base + '/BkTxCd/Prtry/Cd', false);

        // Transaction details – References (first TxDtls child only)
        UpsertColDef(14, 'EndToEndId', 'End-to-End Identification', Base + '/NtryDtls/TxDtls/Refs/EndToEndId', false);
        UpsertColDef(15, 'MndtId', 'Mandate Identification', Base + '/NtryDtls/TxDtls/Refs/MndtId', false);
        UpsertColDef(16, 'InstrId', 'Instruction Identification', Base + '/NtryDtls/TxDtls/Refs/InstrId', false);
        UpsertColDef(17, 'TxAcctSvcrRef', 'Transaction Account Servicer Ref', Base + '/NtryDtls/TxDtls/Refs/AcctSvcrRef', false);

        // Remittance information
        UpsertColDef(18, 'RmtInfUstrd', 'Remittance Info (Unstructured)', Base + '/NtryDtls/TxDtls/RmtInf/Ustrd', false);
        UpsertColDef(19, 'CdtrRef', 'Creditor Reference', Base + '/NtryDtls/TxDtls/RmtInf/Strd/CdtrRefInf/Ref', false);
    end;

    local procedure UpsertColDef(ColNo: Integer; ShortName: Text[250]; ColName: Text[250]; XPath: Text[250]; Mandatory: Boolean)
    var
        DataExchColDef: Record "Data Exch. Column Def";
    begin
        if not DataExchColDef.Get(DefCode(), LineDefCode(), ColNo) then begin
            DataExchColDef.Init();
            DataExchColDef."Data Exch. Def Code" := DefCode();
            DataExchColDef."Data Exch. Line Def Code" := LineDefCode();
            DataExchColDef."Column No." := ColNo;
            DataExchColDef.Insert(true);
        end;

        DataExchColDef.Name := ShortName;
        DataExchColDef.Name := ColName;
        DataExchColDef.Path := XPath;
        DataExchColDef."Data Type" := ResolveDataType(ColNo);
        DataExchColDef.Modify(true);
    end;

    // Assigns the most appropriate Data Exchange column data type by column number.
    // Columns with Decimal/Date values are flagged accordingly; all others are Text.
    local procedure ResolveDataType(ColNo: Integer): Option
    var
        DataExchColDef: Record "Data Exch. Column Def";
    begin
        case ColNo of
            2:       // Amt
                exit(DataExchColDef."Data Type"::Decimal);
            6, 7:    // BookgDt, ValDt
                exit(DataExchColDef."Data Type"::Date);
            else
                exit(DataExchColDef."Data Type"::Text);
        end;
    end;
}
