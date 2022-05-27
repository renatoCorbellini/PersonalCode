SELECT
    [Contact Record].[Record ID],
    [Contact Record].[VVModifyDate],
    [Contact Record].[Status],
    [Designee].[Status],
    [Designee].[Type Facility]
FROM
    [OpPerm Operational Permit]
    INNER JOIN [Designee] ON [Designee].[Operational Permit ID] = [OpPerm Operational Permit].[OperationalPermitID]
    INNER JOIN [Contact Record] ON [Contact Record].[Record ID] = [Designee].[Contact ID]
WHERE
    [Contact Record].[Record ID] NOT IN (
        SELECT
            [Contact Record].[Record ID]
        FROM
            [OpPerm Operational Permit]
            INNER JOIN [Designee] ON [Designee].[Operational Permit ID] = [OpPerm Operational Permit].[OperationalPermitID]
            INNER JOIN [Contact Record] ON [Contact Record].[Record ID] = [Designee].[Contact ID]
        WHERE
            [Contact Record].[Status] = 'Active'
            AND [Designee].[Status] = 'Active'
            AND ([Designee].[Type Facility] = 'true')
    )
ORDER BY
    [Contact Record].[VVModifyDate] DESC