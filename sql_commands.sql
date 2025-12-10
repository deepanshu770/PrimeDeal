
CREATE TABLE User (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  fullname        VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  phoneNumber     VARCHAR(50) NOT NULL UNIQUE,
  passwordHash    VARCHAR(255) NOT NULL,
  profilePicture  VARCHAR(255),
  admin           BOOLEAN DEFAULT FALSE,
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Category (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE Product (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  categoryId  INT NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  brand       VARCHAR(255),
  image       VARCHAR(255) NOT NULL,
  netQty      INT,
  unit        ENUM('g','kg','mg','lb','oz','ml','l','cl','gal',
                   'pcs','pack','box','bottle','can','jar','bag',
                   'dozen','pair','tray'),
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (categoryId) REFERENCES Category(id)
);

CREATE TABLE Shop (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL,
  storeName     VARCHAR(255) NOT NULL,
  description   TEXT,
  storeBanner   VARCHAR(255),
  city          VARCHAR(255) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  latitude      FLOAT NOT NULL,
  longitude     FLOAT NOT NULL,
  deliveryTime  INT NOT NULL,
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE Address (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL,
  addressLine1  VARCHAR(255) NOT NULL,
  addressLine2  VARCHAR(255),
  city          VARCHAR(255) NOT NULL,
  state         VARCHAR(255) NOT NULL,
  postalCode    VARCHAR(20) NOT NULL,
  country       VARCHAR(255) NOT NULL,
  latitude      FLOAT,
  longitude     FLOAT,
  isDefault     BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE ShopInventory (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  shopId      INT NOT NULL,
  productId   INT NOT NULL,
  price       FLOAT NOT NULL,
  quantity    INT NOT NULL,
  netQty      FLOAT NOT NULL,
  unit        ENUM('g','kg','mg','lb','oz','ml','l','cl','gal',
                   'pcs','pack','box','bottle','can','jar','bag',
                   'dozen','pair','tray') NOT NULL,
  isAvailable BOOLEAN DEFAULT TRUE,

  UNIQUE (shopId, productId),

  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);

CREATE TABLE `Order` (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  userId            INT NOT NULL,
  shopId            INT NOT NULL,
  deliveryAddressId INT NOT NULL,
  totalAmount       FLOAT NOT NULL,
  orderStatus       ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery',
                         'delivered', 'cancelled', 'failed') DEFAULT 'pending',
  paymentStatus     ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (shopId) REFERENCES Shop(id),
  FOREIGN KEY (deliveryAddressId) REFERENCES Address(id)
);

CREATE TABLE OrderItem (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  orderId       INT NOT NULL,
  productId     INT NOT NULL,
  quantity      INT NOT NULL,
  pricePerUnit  FLOAT NOT NULL,

  FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

CREATE TABLE Delivery (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  orderId        INT NOT NULL UNIQUE,
  agentId        INT,
  deliveryStatus ENUM('pending_assignment','assigned','picked_up','delivered','failed') DEFAULT 'pending_assignment',
  assignedAt     DATETIME,
  pickedUpAt     DATETIME,
  deliveredAt    DATETIME,

  FOREIGN KEY (orderId) REFERENCES `Order`(id),
  FOREIGN KEY (agentId) REFERENCES DeliveryAgent(id)
);

CREATE TABLE Payment (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  orderId        INT NOT NULL UNIQUE,
  paymentMethod  VARCHAR(50) NOT NULL,
  transactionId  VARCHAR(255),
  amount         FLOAT NOT NULL,
  paymentStatus  ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orderId) REFERENCES `Order`(id)
);




CREATE TABLE DeliveryAgent (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  firstName        VARCHAR(255) NOT NULL,
  lastName         VARCHAR(255) NOT NULL,
  phoneNumber      VARCHAR(50) NOT NULL UNIQUE,
  passwordHash     VARCHAR(255) NOT NULL,
  vehicleNumber    VARCHAR(255),
  currentLatitude  FLOAT,
  currentLongitude FLOAT,
  isAvailable      BOOLEAN DEFAULT TRUE,
  createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP
);