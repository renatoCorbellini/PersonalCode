SELECT
    [OpPerm Certificate].[Permit Type],
    [OpPerm Certificate].[Permit Classification],
    [OpPerm Certificate].[Operational Permit ID],
    [OpPerm Certificate].[Business ID],
    [OpPerm Certificate].[facility Name],
    [OpPerm Certificate].[address],
    [OpPerm Certificate].dhid
FROM
    [OpPerm Certificate]
    JOIN [OpPerm Operational Permit] ON [OpPerm Operational Permit].[OperationalPermitID] = [OpPerm Certificate].[Operational Permit ID]
WHERE
    [OpPerm Operational Permit].[Migration Renewal] = 'False'
    AND [OpPerm Certificate].[Renewal Invoice Sent] <> 'True'
    AND [OpPerm Certificate].[Certificate Year] = '2021'