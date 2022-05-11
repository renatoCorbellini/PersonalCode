SELECT TOP 1000 *
FROM [Fee Lookup]
WHERE '${TodayVar}' 
    BETWEEN [Effectivity Start Date] 
    AND [Effectivity End Date]
ORDER BY [Fee Name] ASC