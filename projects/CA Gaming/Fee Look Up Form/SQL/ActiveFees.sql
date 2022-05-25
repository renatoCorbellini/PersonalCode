-- Old query
SELECT TOP 1000 *
FROM [Fee Lookup]
WHERE GETDATE()
    BETWEEN [Effectivity Start Date] 
    AND [Effectivity End Date] + 1
ORDER BY [Fee Name] ASC

-- Actual query used
SELECT TOP 1000 *
FROM [Fee Lookup]
WHERE
    [Effectivity Start Date] <= GETDATE()
    AND [Effectivity End Date] >= CAST(GETDATE() as date)
ORDER BY [Fee Name] ASC