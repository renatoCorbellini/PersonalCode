SELECT
    f.id AS idFuncionario,
    f.cuil,
    f.nombre,
    f.apellido,
    pr.profesion,
    o.calle,
    o.numero
FROM
    funcionario f
    JOIN profesion pr ON (f.idprofesion = pr.id)
    JOIN oficina o ON (f.idOficina = o.id)
WHERE
    o.idCiudad BETWEEN 1
    AND 25
ORDER BY
    f.id;

select
    funcionario.id as idFuncionario,
    funcionario.cuil,
    funcionario.nombre,
    funcionario.apellido,
    profesion.profesion,
    oficina.calle,
    oficina.numero
from
    funcionario
    join profesion on (functionario.idprofesion = profesion.id)
    join oficina on (funcionario.idOficina = oficina.id)
where
    oficina.idCiudad between 1
    and 25
order by
    funcionario.id;