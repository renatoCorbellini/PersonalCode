CREATE TABLE Provincia (
    id int,
    provincia varchar(100),
    PRIMARY KEY (id)
);

CREATE TABLE Ciudad (
    id int,
    ciudad varchar(100),
    codigoPostal int,
    idProvincia int,
    PRIMARY KEY (id),
    UNIQUE (codigoPostal),
    FOREIGN KEY (idProvincia) REFERENCES Provincia (id)
);

CREATE TABLE Oficina (
    id int,
    calle varchar(100),
    numero int,
    piso int,
    nroLocal int,
    idCiudad int,
    PRIMARY KEY (id),
    FOREIGN KEY (idCiudad) REFERENCES Ciudad (id)
);

CREATE TABLE Profesion (
    id int,
    profesion varchar(100),
    PRIMARY KEY (id)
);

CREATE TABLE Funcionario (
    id int,
    CUIL int,
    nombre varchar(100),
    apellido varchar(100),
    idProfesion int,
    idOficina int,
    FuncionarioACargo int,
    PRIMARY KEY (id),
    UNIQUE (CUIL),
    FOREIGN KEY (FuncionarioACargo) REFERENCES Funcionario (id),
    FOREIGN KEY (idProfesion) REFERENCES Profesion (id),
    FOREIGN KEY (idOficina) REFERENCES Oficina (id)
);

CREATE TABLE onlinecustomers (
    id INT customerName VARCHAR(100),
    city VARCHAR(100),
    email VARCHAR(100) PRIMARY KEY (id),
    UNIQUE (email)
) CREATE TABLE orders (
    id INT,
    customerId INT,
    orderTotal float,
    discountRate float,
    orderDate DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (customerId) REFERENCES onlinecustomers (id),
) CREATE TABLE sales (
    id INT,
    orderId INT,
    salesTotal FLOAT,
    PRIMARY KEY (id),
    FOREIGN KEY (orderId) REFERENCES orders (id)
)