# Dokumentowe bazy danych – MongoDB


### **Imiona i nazwiska autorów:** 
- Jakub Fabia
- Michał Gontarz
--- 

# Zadanie 1 - operacje wyszukiwania danych,  przetwarzanie dokumentów

### a)

stwórz kolekcję  `OrdersInfo`  zawierającą następujące dane o zamówieniach
- pojedynczy dokument opisuje jedno zamówienie

```js
[  
  {  
    "_id": ...
    
    OrderID": ... numer zamówienia
    
    "Customer": {  ... podstawowe informacje o kliencie skladającym  
      "CustomerID": ... identyfikator klienta
      "CompanyName": ... nazwa klienta
      "City": ... miasto 
      "Country": ... kraj 
    },  
    
    "Employee": {  ... podstawowe informacje o pracowniku obsługującym zamówienie
      "EmployeeID": ... idntyfikator pracownika 
      "FirstName": ... imie   
      "LastName": ... nazwisko
      "Title": ... stanowisko  
     
    },  
    
    "Dates": {
       "OrderDate": ... data złożenia zamówienia
       "RequiredDate": data wymaganej realizacji
    }

    "Orderdetails": [  ... pozycje/szczegóły zamówienia - tablica takich pozycji 
      {  
        "UnitPrice": ... cena
        "Quantity": ... liczba sprzedanych jednostek towaru
        "Discount": ... zniżka  
        "Value": ... wartośc pozycji zamówienia
        "product": { ... podstawowe informacje o produkcie 
          "ProductID": ... identyfikator produktu  
          "ProductName": ... nazwa produktu 
          "QuantityPerUnit": ... opis/opakowannie
          "CategoryID": ... identyfikator kategorii do której należy produkt
          "CategoryName" ... nazwę tej kategorii
        },  
      },  
      ...   
    ],  

    "Freight": ... opłata za przesyłkę
    "OrderTotal"  ... sumaryczna wartosc sprzedanych produktów

    "Shipment" : {  ... informacja o wysyłce
        "Shipper": { ... podstawowe inf o przewoźniku 
           "ShipperID":  
            "CompanyName":
        }  
        ... inf o odbiorcy przesyłki
        "ShipName": ...
        "ShipAddress": ...
        "ShipCity": ... 
        "ShipCountry": ...
    } 
  } 
]  
```


### b)

stwórz kolekcję  `CustomerInfo`  zawierającą następujące dane kazdym klencie
- pojedynczy dokument opisuje jednego klienta

```js
[  
  {  
    "_id": ...
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
    "City": ... miasto 
    "Country": ... kraj 

	"Orders": [ ... tablica zamówień klienta o strukturze takiej jak w punkcie a) (oczywiście bez informacji o kliencie)
	  
	]

		  
]  
```

### c) 

Napisz polecenie/zapytanie: Dla każdego klienta pokaż wartość zakupionych przez niego produktów z kategorii 'Confections'  w 1997r
- Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
	"ConfectionsSale97": ... wartość zakupionych przez niego produktów z kategorii 'Confections'  w 1997r

  }		  
]  
```

### d)

Napisz polecenie/zapytanie:  Dla każdego klienta poaje wartość sprzedaży z podziałem na lata i miesiące
Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta

	"Sale": [ ... tablica zawierająca inf o sprzedazy
	    {
            "Year":  ....
            "Month": ....
            "Total": ...	    
	    }
	    ...
	]
  }		  
]  
```

### e)

Załóżmy że pojawia się nowe zamówienie dla klienta 'ALFKI',  zawierające dwa produkty 'Chai' oraz "Ikura"
- pozostałe pola w zamówieniu (ceny, liczby sztuk prod, inf o przewoźniku itp. możesz uzupełnić wg własnego uznania)
Napisz polecenie które dodaje takie zamówienie do bazy
- aktualizując oryginalne kolekcje `orders`, `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

Napisz polecenie 
- aktualizując oryginalną kolekcję orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

### f)

Napisz polecenie które modyfikuje zamówienie dodane w pkt e)  zwiększając zniżkę  o 5% (dla każdej pozycji tego zamówienia) 

Napisz polecenie 
- aktualizując oryginalną kolekcję `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`



UWAGA:
W raporcie należy zamieścić kod poleceń oraz uzyskany rezultat, np wynik  polecenia `db.kolekcka.find().limit(2)` lub jego fragment


## Zadanie 1  - rozwiązanie


### a)

**Zapytanie:**
```js
db.orders.aggregate([
  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
    }
  },
  { $unwind: "$Orderdetails" },
  {
    $lookup: {
      from: "products",
      localField: "Orderdetails.ProductID",
      foreignField: "ProductID",
      as: "Product"
    }
  },
  { $unwind: "$Product" },
  {
    $lookup: {
      from: "categories",
      localField: "Product.CategoryID",
      foreignField: "CategoryID",
      as: "Category"
    }
  },
  { $unwind: "$Category" },
  {
    $addFields: {
      "Orderdetails.Value": {
        $multiply: [
          "$Orderdetails.UnitPrice",
          "$Orderdetails.Quantity",
          { $subtract: [1, "$Orderdetails.Discount"] }
        ]
      },
      "Orderdetails.product": {
        ProductID: "$Product.ProductID",
        ProductName: "$Product.ProductName",
        QuantityPerUnit: "$Product.QuantityPerUnit",
        CategoryID: "$Category.CategoryID",
        CategoryName: "$Category.CategoryName"
      }
    }
  },
  {
    $group: {
      _id: "$OrderID",
      OrderID: { $first: "$OrderID" },
      CustomerID: { $first: "$CustomerID" },
      EmployeeID: { $first: "$EmployeeID" },
      OrderDate: { $first: "$OrderDate" },
      RequiredDate: { $first: "$RequiredDate" },
      Freight: { $first: "$Freight" },
      ShipVia: { $first: "$ShipVia" },
      ShipName: { $first: "$ShipName" },
      ShipAddress: { $first: "$ShipAddress" },
      ShipCity: { $first: "$ShipCity" },
      ShipCountry: { $first: "$ShipCountry" },
      Orderdetails: { 
        $push: {
          UnitPrice: "$Orderdetails.UnitPrice",
          Quantity: "$Orderdetails.Quantity",
          Discount: "$Orderdetails.Discount",
          Value: "$Orderdetails.Value",
          product: "$Orderdetails.product"
        }
      }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },
  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "Employee"
    }
  },
  { $unwind: "$Employee" },
  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "Shipper"
    }
  },
  { $unwind: "$Shipper" },
  {
    $addFields: {
      OrderTotal: {
        $sum: "$Orderdetails.Value"
      }
    }
  },
  {
    $project: {
      _id: 0,
      OrderID: 1,
      Customer: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        City: "$Customer.City",
        Country: "$Customer.Country"
      },
      Employee: {
        EmployeeID: "$Employee.EmployeeID",
        FirstName: "$Employee.FirstName",
        LastName: "$Employee.LastName",
        Title: "$Employee.Title"
      },
      Dates: {
        OrderDate: "$OrderDate",
        RequiredDate: "$RequiredDate"
      },
      Orderdetails: 1,
      Freight: 1,
      OrderTotal: 1,
      Shipment: {
        Shipper: {
          ShipperID: "$Shipper.ShipperID",
          CompanyName: "$Shipper.CompanyName"
        },
        ShipName: "$ShipName",
        ShipAddress: "$ShipAddress",
        ShipCity: "$ShipCity",
        ShipCountry: "$ShipCountry"
      }
    }
  },
  { $out: "OrdersInfo" }
]);
```

**Rezultat:**

```json
db.OrdersInfo.find().limit(2)

[
  {
    "_id": {"$oid": "682462ab01d3c6ef851f862a"},
    "Customer": {
      "CustomerID": "MEREP",
      "CompanyName": "Mère Paillarde",
      "City": "Montréal",
      "Country": "Canada"
    },
    "Dates": {
      "OrderDate": {"$date": "1997-02-07T00:00:00.000Z"},
      "RequiredDate": {"$date": "1997-03-07T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 6,
      "FirstName": "Michael",
      "LastName": "Suyama",
      "Title": "Sales Representative"
    },
    "Freight": 4.07,
    "OrderID": 10439,
    "OrderTotal": 1078,
    "Orderdetails": [
      {
        "UnitPrice": 30.4,
        "Quantity": 15,
        "Discount": 0,
        "Value": 456,
        "product": {
          "ProductID": 12,
          "ProductName": "Queso Manchego La Pastora",
          "QuantityPerUnit": "10 - 500 g pkgs.",
          "CategoryID": 4,
          "CategoryName": "Dairy Products"
        }
      },
      {
        "UnitPrice": 13.9,
        "Quantity": 16,
        "Discount": 0,
        "Value": 222.4,
        "product": {
          "ProductID": 16,
          "ProductName": "Pavlova",
          "QuantityPerUnit": "32 - 500 g boxes",
          "CategoryID": 3,
          "CategoryName": "Confections"
        }
      },
      {
        "UnitPrice": 26.6,
        "Quantity": 6,
        "Discount": 0,
        "Value": 159.60000000000002,
        "product": {
          "ProductID": 64,
          "ProductName": "Wimmers gute Semmelknödel",
          "QuantityPerUnit": "20 bags x 4 pieces",
          "CategoryID": 5,
          "CategoryName": "Grains/Cereals"
        }
      },
      {
        "UnitPrice": 8,
        "Quantity": 30,
        "Discount": 0,
        "Value": 240,
        "product": {
          "ProductID": 74,
          "ProductName": "Longlife Tofu",
          "QuantityPerUnit": "5 kg pkg.",
          "CategoryID": 7,
          "CategoryName": "Produce"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 3,
        "CompanyName": "Federal Shipping"
      },
      "ShipName": "Mère Paillarde",
      "ShipAddress": "43 rue St. Laurent",
      "ShipCity": "Montréal",
      "ShipCountry": "Canada"
    }
  },
  {
    "_id": {"$oid": "682462ab01d3c6ef851f862b"},
    "Customer": {
      "CustomerID": "LEHMS",
      "CompanyName": "Lehmanns Marktstand",
      "City": "Frankfurt a.M.",
      "Country": "Germany"
    },
    "Dates": {
      "OrderDate": {"$date": "1997-07-08T00:00:00.000Z"},
      "RequiredDate": {"$date": "1997-08-05T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 3,
      "FirstName": "Janet",
      "LastName": "Leverling",
      "Title": "Sales Representative"
    },
    "Freight": 32.1,
    "OrderID": 10592,
    "OrderTotal": 516.4674995949492,
    "Orderdetails": [
      {
        "UnitPrice": 15.5,
        "Quantity": 25,
        "Discount": 0.05000000074505806,
        "Value": 368.12499971129,
        "product": {
          "ProductID": 15,
          "ProductName": "Genen Shouyu",
          "QuantityPerUnit": "24 - 250 ml bottles",
          "CategoryID": 2,
          "CategoryName": "Condiments"
        }
      },
      {
        "UnitPrice": 31.23,
        "Quantity": 5,
        "Discount": 0.05000000074505806,
        "Value": 148.3424998836592,
        "product": {
          "ProductID": 26,
          "ProductName": "Gumbär Gummibärchen",
          "QuantityPerUnit": "100 - 250 g bags",
          "CategoryID": 3,
          "CategoryName": "Confections"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 1,
        "CompanyName": "Speedy Express"
      },
      "ShipName": "Lehmanns Marktstand",
      "ShipAddress": "Magazinweg 7",
      "ShipCity": "Frankfurt a.M.",
      "ShipCountry": "Germany"
    }
  }
]
```

### b)

**Zapytanie:**

```js
db.OrdersInfo.aggregate([
  {
    $group: {
      _id: "$Customer.CustomerID",
      CompanyName: { $first: "$Customer.CompanyName" },
      City: { $first: "$Customer.City" },
      Country: { $first: "$Customer.Country" },
      Orders: {
        $push: {
          OrderID: "$OrderID",
          Employee: "$Employee",
          Dates: "$Dates",
          Orderdetails: "$Orderdetails",
          Freight: "$Freight",
          OrderTotal: "$OrderTotal",
          Shipment: "$Shipment"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      City: 1,
      Country: 1,
      Orders: 1
    }
  },
  { $out: "CustomerInfo" }
]);
```

**Rezultat:**

```json
db.CustomerInfo.find().limit(2)

[
  {
    "_id": {"$oid": "682462b201d3c6ef851f8968"},
    "City": "Bern",
    "CompanyName": "Chop-suey Chinese",
    "Country": "Switzerland",
    "CustomerID": "CHOPS",
    "Orders": [
      {
        "OrderID": 10370,
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1996-12-03T00:00:00.000Z"},
          "RequiredDate": {"$date": "1996-12-31T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 14.4,
            "Quantity": 15,
            "Discount": 0.15000000596046448,
            "Value": 183.59999871253967,
            "product": {
              "ProductID": 1,
              "ProductName": "Chai",
              "QuantityPerUnit": "10 boxes x 20 bags",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 26.6,
            "Quantity": 30,
            "Discount": 0,
            "Value": 798,
            "product": {
              "ProductID": 64,
              "ProductName": "Wimmers gute Semmelknödel",
              "QuantityPerUnit": "20 bags x 4 pieces",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          },
          {
            "UnitPrice": 8,
            "Quantity": 20,
            "Discount": 0.15000000596046448,
            "Value": 135.99999904632568,
            "product": {
              "ProductID": 74,
              "ProductName": "Longlife Tofu",
              "QuantityPerUnit": "5 kg pkg.",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Freight": 1.17,
        "OrderTotal": 1117.5999977588654,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 10731,
        "Employee": {
          "EmployeeID": 7,
          "FirstName": "Robert",
          "LastName": "King",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-11-06T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-12-04T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 10,
            "Quantity": 40,
            "Discount": 0.05000000074505806,
            "Value": 379.9999997019768,
            "product": {
              "ProductID": 21,
              "ProductName": "Sir Rodney's Scones",
              "QuantityPerUnit": "24 pkgs. x 4 pieces",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          },
          {
            "UnitPrice": 53,
            "Quantity": 30,
            "Discount": 0.05000000074505806,
            "Value": 1510.4999988153577,
            "product": {
              "ProductID": 51,
              "ProductName": "Manjimup Dried Apples",
              "QuantityPerUnit": "50 - 300 g pkgs.",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Freight": 96.65,
        "OrderTotal": 1890.4999985173345,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 10746,
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-11-19T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-12-17T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 6,
            "Quantity": 6,
            "Discount": 0,
            "Value": 36,
            "product": {
              "ProductID": 13,
              "ProductName": "Konbu",
              "QuantityPerUnit": "2 kg box",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 14,
            "Quantity": 28,
            "Discount": 0,
            "Value": 392,
            "product": {
              "ProductID": 42,
              "ProductName": "Singaporean Hokkien Fried Mee",
              "QuantityPerUnit": "32 - 1 kg pkgs.",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          },
          {
            "UnitPrice": 49.3,
            "Quantity": 9,
            "Discount": 0,
            "Value": 443.7,
            "product": {
              "ProductID": 62,
              "ProductName": "Tarte au sucre",
              "QuantityPerUnit": "48 pies",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          },
          {
            "UnitPrice": 36,
            "Quantity": 40,
            "Discount": 0,
            "Value": 1440,
            "product": {
              "ProductID": 69,
              "ProductName": "Gudbrandsdalsost",
              "QuantityPerUnit": "10 kg pkg.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          }
        ],
        "Freight": 31.43,
        "OrderTotal": 2311.7,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 10519,
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-04-28T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-05-26T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 31,
            "Quantity": 16,
            "Discount": 0.05000000074505806,
            "Value": 471.1999996304512,
            "product": {
              "ProductID": 10,
              "ProductName": "Ikura",
              "QuantityPerUnit": "12 - 200 ml jars",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 38,
            "Quantity": 40,
            "Discount": 0,
            "Value": 1520,
            "product": {
              "ProductID": 56,
              "ProductName": "Gnocchi di nonna Alice",
              "QuantityPerUnit": "24 - 250 g pkgs.",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          },
          {
            "UnitPrice": 34,
            "Quantity": 10,
            "Discount": 0.05000000074505806,
            "Value": 322.99999974668026,
            "product": {
              "ProductID": 60,
              "ProductName": "Camembert Pierrot",
              "QuantityPerUnit": "15 - 300 g rounds",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          }
        ],
        "Freight": 91.76,
        "OrderTotal": 2314.1999993771315,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 10966,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-03-20T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-04-17T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 26,
            "Quantity": 8,
            "Discount": 0,
            "Value": 208,
            "product": {
              "ProductID": 37,
              "ProductName": "Gravad lax",
              "QuantityPerUnit": "12 - 500 g pkgs.",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 38,
            "Quantity": 12,
            "Discount": 0.15000000596046448,
            "Value": 387.5999972820282,
            "product": {
              "ProductID": 56,
              "ProductName": "Gnocchi di nonna Alice",
              "QuantityPerUnit": "24 - 250 g pkgs.",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          },
          {
            "UnitPrice": 49.3,
            "Quantity": 12,
            "Discount": 0.15000000596046448,
            "Value": 502.8599964737891,
            "product": {
              "ProductID": 62,
              "ProductName": "Tarte au sucre",
              "QuantityPerUnit": "48 pies",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          }
        ],
        "Freight": 27.19,
        "OrderTotal": 1098.4599937558173,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 11029,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-16T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-14T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 38,
            "Quantity": 20,
            "Discount": 0,
            "Value": 760,
            "product": {
              "ProductID": 56,
              "ProductName": "Gnocchi di nonna Alice",
              "QuantityPerUnit": "24 - 250 g pkgs.",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          },
          {
            "UnitPrice": 43.9,
            "Quantity": 12,
            "Discount": 0,
            "Value": 526.8,
            "product": {
              "ProductID": 63,
              "ProductName": "Vegie-spread",
              "QuantityPerUnit": "15 - 625 g jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 47.84,
        "OrderTotal": 1286.8,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 11041,
        "Employee": {
          "EmployeeID": 3,
          "FirstName": "Janet",
          "LastName": "Leverling",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-22T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-20T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 19,
            "Quantity": 30,
            "Discount": 0.20000000298023224,
            "Value": 455.9999983012676,
            "product": {
              "ProductID": 2,
              "ProductName": "Chang",
              "QuantityPerUnit": "24 - 12 oz bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 43.9,
            "Quantity": 30,
            "Discount": 0,
            "Value": 1317,
            "product": {
              "ProductID": 63,
              "ProductName": "Vegie-spread",
              "QuantityPerUnit": "15 - 625 g jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 48.22,
        "OrderTotal": 1772.9999983012676,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      },
      {
        "OrderID": 10254,
        "Employee": {
          "EmployeeID": 5,
          "FirstName": "Steven",
          "LastName": "Buchanan",
          "Title": "Sales Manager"
        },
        "Dates": {
          "OrderDate": {"$date": "1996-07-11T00:00:00.000Z"},
          "RequiredDate": {"$date": "1996-08-08T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 3.6,
            "Quantity": 15,
            "Discount": 0.15000000596046448,
            "Value": 45.89999967813492,
            "product": {
              "ProductID": 24,
              "ProductName": "Guaraná Fantástica",
              "QuantityPerUnit": "12 - 355 ml cans",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 19.2,
            "Quantity": 21,
            "Discount": 0.15000000596046448,
            "Value": 342.7199975967407,
            "product": {
              "ProductID": 55,
              "ProductName": "Pâté chinois",
              "QuantityPerUnit": "24 boxes x 2 pies",
              "CategoryID": 6,
              "CategoryName": "Meat/Poultry"
            }
          },
          {
            "UnitPrice": 8,
            "Quantity": 21,
            "Discount": 0,
            "Value": 168,
            "product": {
              "ProductID": 74,
              "ProductName": "Longlife Tofu",
              "QuantityPerUnit": "5 kg pkg.",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Freight": 22.98,
        "OrderTotal": 556.6199972748757,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Chop-suey Chinese",
          "ShipAddress": "Hauptstr. 31",
          "ShipCity": "Bern",
          "ShipCountry": "Switzerland"
        }
      }
    ]
  },
  {
    "_id": {"$oid": "682462b201d3c6ef851f8969"},
    "City": "Buenos Aires",
    "CompanyName": "Cactus Comidas para llevar",
    "Country": "Argentina",
    "CustomerID": "CACTU",
    "Orders": [
      {
        "OrderID": 10881,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-02-11T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-03-11T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 15,
            "Quantity": 10,
            "Discount": 0,
            "Value": 150,
            "product": {
              "ProductID": 73,
              "ProductName": "Röd Kaviar",
              "QuantityPerUnit": "24 - 150 g jars",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "Freight": 2.84,
        "OrderTotal": 150,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      },
      {
        "OrderID": 10782,
        "Employee": {
          "EmployeeID": 9,
          "FirstName": "Anne",
          "LastName": "Dodsworth",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-12-17T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-01-14T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 12.5,
            "Quantity": 1,
            "Discount": 0,
            "Value": 12.5,
            "product": {
              "ProductID": 31,
              "ProductName": "Gorgonzola Telino",
              "QuantityPerUnit": "12 - 100 g pkgs",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          }
        ],
        "Freight": 1.1,
        "OrderTotal": 12.5,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      },
      {
        "OrderID": 10819,
        "Employee": {
          "EmployeeID": 2,
          "FirstName": "Andrew",
          "LastName": "Fuller",
          "Title": "Vice President, Sales"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-01-07T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-02-04T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 46,
            "Quantity": 7,
            "Discount": 0,
            "Value": 322,
            "product": {
              "ProductID": 43,
              "ProductName": "Ipoh Coffee",
              "QuantityPerUnit": "16 - 500 g tins",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 7.75,
            "Quantity": 20,
            "Discount": 0,
            "Value": 155,
            "product": {
              "ProductID": 75,
              "ProductName": "Rhönbräu Klosterbier",
              "QuantityPerUnit": "24 - 0.5 l bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Freight": 19.76,
        "OrderTotal": 477,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      },
      {
        "OrderID": 10937,
        "Employee": {
          "EmployeeID": 7,
          "FirstName": "Robert",
          "LastName": "King",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-03-10T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-03-24T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 45.6,
            "Quantity": 8,
            "Discount": 0,
            "Value": 364.8,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          },
          {
            "UnitPrice": 14,
            "Quantity": 20,
            "Discount": 0,
            "Value": 280,
            "product": {
              "ProductID": 34,
              "ProductName": "Sasquatch Ale",
              "QuantityPerUnit": "24 - 12 oz bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Freight": 31.51,
        "OrderTotal": 644.8,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      },
      {
        "OrderID": 11054,
        "Employee": {
          "EmployeeID": 8,
          "FirstName": "Laura",
          "LastName": "Callahan",
          "Title": "Inside Sales Coordinator"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-28T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-26T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 2.5,
            "Quantity": 10,
            "Discount": 0,
            "Value": 25,
            "product": {
              "ProductID": 33,
              "ProductName": "Geitost",
              "QuantityPerUnit": "500 g",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          },
          {
            "UnitPrice": 14,
            "Quantity": 20,
            "Discount": 0,
            "Value": 280,
            "product": {
              "ProductID": 67,
              "ProductName": "Laughing Lumberjack Lager",
              "QuantityPerUnit": "24 - 12 oz bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Freight": 0.33,
        "OrderTotal": 305,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      },
      {
        "OrderID": 10521,
        "Employee": {
          "EmployeeID": 8,
          "FirstName": "Laura",
          "LastName": "Callahan",
          "Title": "Inside Sales Coordinator"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-04-29T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-05-27T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 18,
            "Quantity": 3,
            "Discount": 0,
            "Value": 54,
            "product": {
              "ProductID": 35,
              "ProductName": "Steeleye Stout",
              "QuantityPerUnit": "24 - 12 oz bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 9.65,
            "Quantity": 10,
            "Discount": 0,
            "Value": 96.5,
            "product": {
              "ProductID": 41,
              "ProductName": "Jack's New England Clam Chowder",
              "QuantityPerUnit": "12 - 12 oz cans",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 12.5,
            "Quantity": 6,
            "Discount": 0,
            "Value": 75,
            "product": {
              "ProductID": 68,
              "ProductName": "Scottish Longbreads",
              "QuantityPerUnit": "10 boxes x 8 pieces",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          }
        ],
        "Freight": 17.22,
        "OrderTotal": 225.5,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Cactus Comidas para llevar",
          "ShipAddress": "Cerrito 333",
          "ShipCity": "Buenos Aires",
          "ShipCountry": "Argentina"
        }
      }
    ]
  }
]
```

### c)

#### Wariant: Oryginalne kolekcje

**Zapytanie:**

```js
db.orders.aggregate([
  {
    $match: {
      OrderDate: {
        $gte: ISODate("1997-01-01"),
        $lt: ISODate("1998-01-01")
      }
    }
  },
  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Details"
    }
  },
  { $unwind: "$Details" },
  {
    $lookup: {
      from: "products",
      localField: "Details.ProductID",
      foreignField: "ProductID",
      as: "Product"
    }
  },
  { $unwind: "$Product" },
  {
    $lookup: {
      from: "categories",
      localField: "Product.CategoryID",
      foreignField: "CategoryID",
      as: "Category"
    }
  },
  { $unwind: "$Category" },
  { $match: { "Category.CategoryName": "Confections" } },
  {
    $addFields: {
      SaleValue: {
        $multiply: [
          "$Details.UnitPrice",
          "$Details.Quantity",
          { $subtract: [1, "$Details.Discount"] }
        ]
      }
    }
  },
  {
    $group: {
      _id: "$CustomerID",
      ConfectionsSale97: { $sum: "$SaleValue" }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: "$Customer.CompanyName",
      ConfectionsSale97: 1
    }
  }
]);
```

**Resultat:**

```json
[
  {
    "CompanyName": "Berglunds snabbköp",
    "ConfectionsSale97": 561.9599996879697,
    "CustomerID": "BERGS"
  },
  {
    "CompanyName": "White Clover Markets",
    "ConfectionsSale97": 1001.9749971002341,
    "CustomerID": "WHITC"
  }
]
```

#### Wariant: OrdersInfo

**Zapytanie:**

```js
db.OrdersInfo.aggregate([
  {
    $match: {
      "Dates.OrderDate": {
        $gte: ISODate("1997-01-01"),
        $lt: ISODate("1998-01-01")
      }
    }
  },
  { $unwind: "$Orderdetails" },
  {
    $match: { "Orderdetails.product.CategoryName": "Confections" }
  },
  {
    $group: {
      _id: "$Customer.CustomerID",
      CompanyName: { $first: "$Customer.CompanyName" },
      ConfectionsSale97: { $sum: "$Orderdetails.Value" }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1
    }
  }
]);
```

**Rezultat:**

```json
[
  {
    "CompanyName": "Trail's Head Gourmet Provisioners",
    "ConfectionsSale97": 493,
    "CustomerID": "TRAIH"
  },
  {
    "CompanyName": "Suprêmes délices",
    "ConfectionsSale97": 900.3,
    "CustomerID": "SUPRD"
  }
]
```

#### Wariant: CustomerInfo

**Zapytanie:**

```js
db.CustomerInfo.aggregate([
  { $unwind: "$Orders" },
  {
    $match: {
      "Orders.Dates.OrderDate": {
        $gte: ISODate("1997-01-01"),
        $lt: ISODate("1998-01-01")
      }
    }
  },
  { $unwind: "$Orders.Orderdetails" },
  {
    $match: {
      "Orders.Orderdetails.product.CategoryName": "Confections"
    }
  },
  {
    $group: {
      _id: "$CustomerID",
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: {
        $sum: "$Orders.Orderdetails.Value"
      }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1
    }
  }
]);
```

**Rezultat:**

```json
[
  {
    "CompanyName": "Victuailles en stock",
    "ConfectionsSale97": 1972,
    "CustomerID": "VICTE"
  },
  {
    "CompanyName": "Hungry Coyote Import Store",
    "ConfectionsSale97": 1701,
    "CustomerID": "HUNGC"
  }
]
```

### d)

#### Wariant: Oryginalne kolekcje

**Zapytanie:**

```js
db.orders.aggregate([
  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Details"
    }
  },
  { $unwind: "$Details" },
  {
    $addFields: {
      SaleValue: {
        $multiply: [
          "$Details.UnitPrice",
          "$Details.Quantity",
          { $subtract: [1, "$Details.Discount"] }
        ]
      },
      Year: { $year: "$OrderDate" },
      Month: { $month: "$OrderDate" }
    }
  },
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        Year: "$Year",
        Month: "$Month"
      },
      Total: { $sum: "$SaleValue" }
    }
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      Sale: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Total: "$Total"
        }
      }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },

  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: "$Customer.CompanyName",
      Sale: 1
    }
  }
]);
```

**Rezultat:**

```json
[
  {
    "CompanyName": "White Clover Markets",
    "CustomerID": "WHITC",
    "Sale": [
      {
        "Year": 1997,
        "Month": 4,
        "Total": 1388.5
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 3523.4
      },
      {
        "Year": 1996,
        "Month": 11,
        "Total": 2296
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 3535.649989557266
      },
      {
        "Year": 1997,
        "Month": 7,
        "Total": 1180.8799956008793
      },
      {
        "Year": 1997,
        "Month": 3,
        "Total": 1625.4749927669764
      },
      {
        "Year": 1998,
        "Month": 2,
        "Total": 1924.25
      },
      {
        "Year": 1996,
        "Month": 7,
        "Total": 642.1999994963408
      },
      {
        "Year": 1998,
        "Month": 4,
        "Total": 8902.5
      },
      {
        "Year": 1997,
        "Month": 11,
        "Total": 1415.999994724989
      },
      {
        "Year": 1998,
        "Month": 5,
        "Total": 928.75
      }
    ]
  },
  {
    "CompanyName": "Antonio Moreno Taquería",
    "CustomerID": "ANTON",
    "Sale": [
      {
        "Year": 1997,
        "Month": 6,
        "Total": 2082
      },
      {
        "Year": 1996,
        "Month": 11,
        "Total": 403.20000000000005
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 660
      },
      {
        "Year": 1997,
        "Month": 9,
        "Total": 1188.8649942964316
      },
      {
        "Year": 1997,
        "Month": 5,
        "Total": 1940.8499967865646
      },
      {
        "Year": 1997,
        "Month": 4,
        "Total": 749.0624947473407
      }
    ]
  }
]
```

#### Wariant: OrdersInfo

**Zapytanie:**

```js
db.OrdersInfo.aggregate([
  { $unwind: "$Orderdetails" },
  {
    $addFields: {
      Year: { $year: "$Dates.OrderDate" },
      Month: { $month: "$Dates.OrderDate" }
    }
  },
  {
    $group: {
      _id: {
        CustomerID: "$Customer.CustomerID",
        Year: "$Year",
        Month: "$Month"
      },
      CompanyName: { $first: "$Customer.CompanyName" },
      Total: { $sum: "$Orderdetails.Value" }
    }
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$CompanyName" },
      Sale: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Total: "$Total"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      Sale: 1
    }
  }
]);
```

**Rezultat:**

```json
[
  {
    "CompanyName": "Berglunds snabbköp",
    "CustomerID": "BERGS",
    "Sale": [
      {
        "Year": 1997,
        "Month": 5,
        "Total": 3192.65
      },
      {
        "Year": 1997,
        "Month": 11,
        "Total": 1459
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 1835.6999970376492
      },
      {
        "Year": 1997,
        "Month": 9,
        "Total": 4417.079993113875
      },
      {
        "Year": 1996,
        "Month": 12,
        "Total": 2222.3999999999996
      },
      {
        "Year": 1997,
        "Month": 12,
        "Total": 96.5
      },
      {
        "Year": 1997,
        "Month": 8,
        "Total": 1503.6
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 472.5
      },
      {
        "Year": 1996,
        "Month": 8,
        "Total": 2102
      },
      {
        "Year": 1997,
        "Month": 6,
        "Total": 1501.0849990379063
      },
      {
        "Year": 1997,
        "Month": 2,
        "Total": 1206.6
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 3112.7124999999996
      },
      {
        "Year": 1998,
        "Month": 2,
        "Total": 1805.7499997027217
      }
    ]
  },
  {
    "CompanyName": "Antonio Moreno Taquería",
    "CustomerID": "ANTON",
    "Sale": [
      {
        "Year": 1997,
        "Month": 6,
        "Total": 2082
      },
      {
        "Year": 1996,
        "Month": 11,
        "Total": 403.20000000000005
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 660
      },
      {
        "Year": 1997,
        "Month": 9,
        "Total": 1188.8649942964316
      },
      {
        "Year": 1997,
        "Month": 5,
        "Total": 1940.8499967865646
      },
      {
        "Year": 1997,
        "Month": 4,
        "Total": 749.0624947473407
      }
    ]
  }
]
```
#### Wariant: CustomerInfo

**Zapytanie:**

```js
db.CustomerInfo.aggregate([
  { $unwind: "$Orders" },
  { $unwind: "$Orders.Orderdetails" },
  {
    $addFields: {
      Year: { $year: "$Orders.Dates.OrderDate" },
      Month: { $month: "$Orders.Dates.OrderDate" }
    }
  },
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        Year: "$Year",
        Month: "$Month"
      },
      CompanyName: { $first: "$CompanyName" },
      Total: { $sum: "$Orders.Orderdetails.Value" }
    }
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$CompanyName" },
      Sale: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Total: "$Total"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      Sale: 1
    }
  }
]);
```

**Rezultat:**

```json
[
  {
    "CompanyName": "Berglunds snabbköp",
    "CustomerID": "BERGS",
    "Sale": [
      {
        "Year": 1997,
        "Month": 5,
        "Total": 3192.65
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 1835.6999970376492
      },
      {
        "Year": 1997,
        "Month": 11,
        "Total": 1459
      },
      {
        "Year": 1997,
        "Month": 9,
        "Total": 4417.079993113875
      },
      {
        "Year": 1996,
        "Month": 12,
        "Total": 2222.3999999999996
      },
      {
        "Year": 1997,
        "Month": 12,
        "Total": 96.5
      },
      {
        "Year": 1997,
        "Month": 8,
        "Total": 1503.6
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 472.5
      },
      {
        "Year": 1996,
        "Month": 8,
        "Total": 2102
      },
      {
        "Year": 1997,
        "Month": 6,
        "Total": 1501.0849990379063
      },
      {
        "Year": 1997,
        "Month": 2,
        "Total": 1206.6
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 3112.7124999999996
      },
      {
        "Year": 1998,
        "Month": 2,
        "Total": 1805.7499997027217
      }
    ]
  },
  {
    "CompanyName": "Antonio Moreno Taquería",
    "CustomerID": "ANTON",
    "Sale": [
      {
        "Year": 1997,
        "Month": 6,
        "Total": 2082
      },
      {
        "Year": 1996,
        "Month": 11,
        "Total": 403.20000000000005
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 660
      },
      {
        "Year": 1997,
        "Month": 9,
        "Total": 1188.8649942964316
      },
      {
        "Year": 1997,
        "Month": 5,
        "Total": 1940.8499967865646
      },
      {
        "Year": 1997,
        "Month": 4,
        "Total": 749.0624947473407
      }
    ]
  }
]
```

### e)

#### Aktualizuję oryginalne kolekcje: orders, orderdetails

**Zapytanie:**

```js
db.orders.insertOne({
  OrderID: 99999,
  CustomerID: "ALFKI",
  EmployeeID: 5,
  OrderDate: ISODate("1997-07-01"),
  RequiredDate: ISODate("1997-07-15"),
  ShipVia: 1,
  ShipName: "Alfreds Futterkiste",
  ShipAddress: "Obere Str. 57",
  ShipCity: "Berlin",
  ShipCountry: "Germany",
  Freight: 25.0
});

db.products.find({ ProductName: { $in: ["Chai", "Ikura"] } }, { ProductID: 1, ProductName: 1 })
// wyniki tego zapytania to id produktów, które chcemy dodać do zamówienia (1 i 10) - użyte poniżej

db.orderdetails.insertMany([
  {
    OrderID: 99999,
    ProductID: 1,
    UnitPrice: 18.00,
    Quantity: 5,
    Discount: 0.15
  },
  {
    OrderID: 99999,
    ProductID: 10,
    UnitPrice: 31.00,
    Quantity: 3,
    Discount: 0.1
  }
]);
```

**Rezultat:**

```json
db.orders.find({"OrderID" : 99999})

[
  {
    "_id": {"$oid": "682463e4ff8dc46c52559575"},
    "CustomerID": "ALFKI",
    "EmployeeID": 5,
    "Freight": 25,
    "OrderDate": {"$date": "1997-07-01T00:00:00.000Z"},
    "OrderID": 99999,
    "RequiredDate": {"$date": "1997-07-15T00:00:00.000Z"},
    "ShipAddress": "Obere Str. 57",
    "ShipCity": "Berlin",
    "ShipCountry": "Germany",
    "ShipName": "Alfreds Futterkiste",
    "ShipVia": 1
  }
]

db.orderdetails.find({"OrderID" : 99999})

[
  {
    "_id": {"$oid": "682463e9ff8dc46c52559577"},
    "Discount": 0.15000000000000002,
    "OrderID": 99999,
    "ProductID": 1,
    "Quantity": 5,
    "UnitPrice": 18
  },
  {
    "_id": {"$oid": "682463e9ff8dc46c52559578"},
    "Discount": 0.1,
    "OrderID": 99999,
    "ProductID": 10,
    "Quantity": 3,
    "UnitPrice": 31
  }
]
```

#### Aktualizuję kolekcję OrderInfo

**Zapytanie:**

```js
let newOrder = db.orders.aggregate([
  { $match: { OrderID: 99999 } },
  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
    }
  },
  { $unwind: "$Orderdetails" },
  {
    $lookup: {
      from: "products",
      localField: "Orderdetails.ProductID",
      foreignField: "ProductID",
      as: "Product"
    }
  },
  { $unwind: "$Product" },
  {
    $lookup: {
      from: "categories",
      localField: "Product.CategoryID",
      foreignField: "CategoryID",
      as: "Category"
    }
  },
  { $unwind: "$Category" },
  {
    $addFields: {
      "Orderdetails.Value": {
        $multiply: [
          "$Orderdetails.UnitPrice",
          "$Orderdetails.Quantity",
          { $subtract: [1, "$Orderdetails.Discount"] }
        ]
      },
      "Orderdetails.product": {
        ProductID: "$Product.ProductID",
        ProductName: "$Product.ProductName",
        QuantityPerUnit: "$Product.QuantityPerUnit",
        CategoryID: "$Category.CategoryID",
        CategoryName: "$Category.CategoryName"
      }
    }
  },
  {
    $group: {
      _id: "$OrderID",
      OrderID: { $first: "$OrderID" },
      CustomerID: { $first: "$CustomerID" },
      EmployeeID: { $first: "$EmployeeID" },
      OrderDate: { $first: "$OrderDate" },
      RequiredDate: { $first: "$RequiredDate" },
      Freight: { $first: "$Freight" },
      ShipVia: { $first: "$ShipVia" },
      ShipName: { $first: "$ShipName" },
      ShipAddress: { $first: "$ShipAddress" },
      ShipCity: { $first: "$ShipCity" },
      ShipCountry: { $first: "$ShipCountry" },
      Orderdetails: { 
        $push: {
          UnitPrice: "$Orderdetails.UnitPrice",
          Quantity: "$Orderdetails.Quantity",
          Discount: "$Orderdetails.Discount",
          Value: "$Orderdetails.Value",
          product: "$Orderdetails.product"
        }
      }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },
  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "Employee"
    }
  },
  { $unwind: "$Employee" },
  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "Shipper"
    }
  },
  { $unwind: "$Shipper" },
  {
    $addFields: {
      OrderTotal: { $sum: "$Orderdetails.Value" }
    }
  },
  {
    $project: {
      _id: 0,
      OrderID: 1,
      Customer: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        City: "$Customer.City",
        Country: "$Customer.Country"
      },
      Employee: {
        EmployeeID: "$Employee.EmployeeID",
        FirstName: "$Employee.FirstName",
        LastName: "$Employee.LastName",
        Title: "$Employee.Title"
      },
      Dates: {
        OrderDate: "$OrderDate",
        RequiredDate: "$RequiredDate"
      },
      Orderdetails: 1,
      Freight: 1,
      OrderTotal: 1,
      Shipment: {
        Shipper: {
          ShipperID: "$Shipper.ShipperID",
          CompanyName: "$Shipper.CompanyName"
        },
        ShipName: "$ShipName",
        ShipAddress: "$ShipAddress",
        ShipCity: "$ShipCity",
        ShipCountry: "$ShipCountry"
      }
    }
  }
]).toArray()[0];

db.OrdersInfo.insertOne(newOrder);
```

**Rezultat:**

```json
db.OrdersInfo.find({"OrderID" : 99999})

[
  {
    "_id": {"$oid": "682462d7ff8dc46c52559572"},
    "Customer": {
      "CustomerID": "ALFKI",
      "CompanyName": "Alfreds Futterkiste",
      "City": "Berlin",
      "Country": "Germany"
    },
    "Dates": {
      "OrderDate": {"$date": "1997-07-01T00:00:00.000Z"},
      "RequiredDate": {"$date": "1997-07-15T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 5,
      "FirstName": "Steven",
      "LastName": "Buchanan",
      "Title": "Sales Manager"
    },
    "Freight": 25,
    "OrderID": 99999,
    "OrderTotal": 160.2,
    "Orderdetails": [
      {
        "UnitPrice": 18,
        "Quantity": 5,
        "Discount": 0.15000000000000002,
        "Value": 76.5,
        "product": {
          "ProductID": 1,
          "ProductName": "Chai",
          "QuantityPerUnit": "10 boxes x 20 bags",
          "CategoryID": 1,
          "CategoryName": "Beverages"
        }
      },
      {
        "UnitPrice": 31,
        "Quantity": 3,
        "Discount": 0.1,
        "Value": 83.7,
        "product": {
          "ProductID": 10,
          "ProductName": "Ikura",
          "QuantityPerUnit": "12 - 200 ml jars",
          "CategoryID": 8,
          "CategoryName": "Seafood"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 1,
        "CompanyName": "Speedy Express"
      },
      "ShipName": "Alfreds Futterkiste",
      "ShipAddress": "Obere Str. 57",
      "ShipCity": "Berlin",
      "ShipCountry": "Germany"
    }
  }
]
```

#### Aktualizuję kolekcję CustomerInfo

**Zapytanie:**

```js
delete newOrder.Customer;

db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  { $push: { Orders: newOrder } }
);
```

**Rezultat:**

```json
db.CustomerInfo.find({"CustomerID": "ALFKI"})

[
  {
    "_id": {"$oid": "682462b201d3c6ef851f898d"},
    "City": "Berlin",
    "CompanyName": "Alfreds Futterkiste",
    "Country": "Germany",
    "CustomerID": "ALFKI",
    "Orders": [
      {
        "OrderID": 10692,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-10-03T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-10-31T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 43.9,
            "Quantity": 20,
            "Discount": 0,
            "Value": 878,
            "product": {
              "ProductID": 63,
              "ProductName": "Vegie-spread",
              "QuantityPerUnit": "15 - 625 g jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 61.02,
        "OrderTotal": 878,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10952,
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-03-16T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-04-27T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 25,
            "Quantity": 16,
            "Discount": 0.05000000074505806,
            "Value": 379.9999997019768,
            "product": {
              "ProductID": 6,
              "ProductName": "Grandma's Boysenberry Spread",
              "QuantityPerUnit": "12 - 8 oz jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          },
          {
            "UnitPrice": 45.6,
            "Quantity": 2,
            "Discount": 0,
            "Value": 91.2,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Freight": 40.42,
        "OrderTotal": 471.19999970197676,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10702,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-10-13T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-11-24T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 10,
            "Quantity": 6,
            "Discount": 0,
            "Value": 60,
            "product": {
              "ProductID": 3,
              "ProductName": "Aniseed Syrup",
              "QuantityPerUnit": "12 - 550 ml bottles",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 15,
            "Discount": 0,
            "Value": 270,
            "product": {
              "ProductID": 76,
              "ProductName": "Lakkalikööri",
              "QuantityPerUnit": "500 ml",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Freight": 23.94,
        "OrderTotal": 330,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10643,
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-08-25T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-09-22T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 45.6,
            "Quantity": 15,
            "Discount": 0.25,
            "Value": 513,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 21,
            "Discount": 0.25,
            "Value": 283.5,
            "product": {
              "ProductID": 39,
              "ProductName": "Chartreuse verte",
              "QuantityPerUnit": "750 cc per bottle",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 12,
            "Quantity": 2,
            "Discount": 0.25,
            "Value": 18,
            "product": {
              "ProductID": 46,
              "ProductName": "Spegesild",
              "QuantityPerUnit": "4 - 450 g glasses",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "Freight": 29.46,
        "OrderTotal": 814.5,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfreds Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10835,
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-01-15T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-02-12T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 55,
            "Quantity": 15,
            "Discount": 0,
            "Value": 825,
            "product": {
              "ProductID": 59,
              "ProductName": "Raclette Courdavault",
              "QuantityPerUnit": "5 kg pkg.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          },
          {
            "UnitPrice": 13,
            "Quantity": 2,
            "Discount": 0.20000000298023224,
            "Value": 20.799999922513962,
            "product": {
              "ProductID": 77,
              "ProductName": "Original Frankfurter grüne Soße",
              "QuantityPerUnit": "12 boxes",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 69.53,
        "OrderTotal": 845.799999922514,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 11011,
        "Employee": {
          "EmployeeID": 3,
          "FirstName": "Janet",
          "LastName": "Leverling",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-09T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-07T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 13.25,
            "Quantity": 40,
            "Discount": 0.05000000074505806,
            "Value": 503.4999996051192,
            "product": {
              "ProductID": 58,
              "ProductName": "Escargots de Bourgogne",
              "QuantityPerUnit": "24 pieces",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 21.5,
            "Quantity": 20,
            "Discount": 0,
            "Value": 430,
            "product": {
              "ProductID": 71,
              "ProductName": "Flotemysost",
              "QuantityPerUnit": "10 - 500 g pkgs.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          }
        ],
        "Freight": 1.21,
        "OrderTotal": 933.4999996051192,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 99999,
        "Freight": 25,
        "Orderdetails": [
          {
            "UnitPrice": 18,
            "Quantity": 5,
            "Discount": 0.15000000000000002,
            "Value": 76.5,
            "product": {
              "ProductID": 1,
              "ProductName": "Chai",
              "QuantityPerUnit": "10 boxes x 20 bags",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 31,
            "Quantity": 3,
            "Discount": 0.1,
            "Value": 83.7,
            "product": {
              "ProductID": 10,
              "ProductName": "Ikura",
              "QuantityPerUnit": "12 - 200 ml jars",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 5,
          "FirstName": "Steven",
          "LastName": "Buchanan",
          "Title": "Sales Manager"
        },
        "OrderTotal": 160.2,
        "Dates": {
          "OrderDate": {"$date": "1997-07-01T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-07-15T00:00:00.000Z"}
        },
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfreds Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      }
    ]
  }
]
```

### f)

#### Aktualizacja orderdetails

**Zapytanie:**

```js
db.orderdetails.updateMany(
  { OrderID: 99999 },
  [
    {
      $set: {
        Discount: { $add: ["$Discount", 0.05] }
      }
    }
  ]
);
```

**Rezultat:**

```json
db.orderdetails.find({"OrderID" : 99999})

[
  {
    "_id": {"$oid": "682463e9ff8dc46c52559577"},
    "Discount": 0.2,
    "OrderID": 99999,
    "ProductID": 1,
    "Quantity": 5,
    "UnitPrice": 18
  },
  {
    "_id": {"$oid": "682463e9ff8dc46c52559578"},
    "Discount": 0.15000000000000002,
    "OrderID": 99999,
    "ProductID": 10,
    "Quantity": 3,
    "UnitPrice": 31
  }
]
```

#### Aktualizacja OrderInfo

**Zapytanie:**

```js
let updatedOrder = db.orders.aggregate([
  { $match: { OrderID: 99999 } },
  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
    }
  },
  { $unwind: "$Orderdetails" },
  {
    $lookup: {
      from: "products",
      localField: "Orderdetails.ProductID",
      foreignField: "ProductID",
      as: "Product"
    }
  },
  { $unwind: "$Product" },
  {
    $lookup: {
      from: "categories",
      localField: "Product.CategoryID",
      foreignField: "CategoryID",
      as: "Category"
    }
  },
  { $unwind: "$Category" },
  {
    $addFields: {
      "Orderdetails.Value": {
        $multiply: [
          "$Orderdetails.UnitPrice",
          "$Orderdetails.Quantity",
          { $subtract: [1, "$Orderdetails.Discount"] }
        ]
      },
      "Orderdetails.product": {
        ProductID: "$Product.ProductID",
        ProductName: "$Product.ProductName",
        QuantityPerUnit: "$Product.QuantityPerUnit",
        CategoryID: "$Category.CategoryID",
        CategoryName: "$Category.CategoryName"
      }
    }
  },
  {
    $group: {
      _id: "$OrderID",
      OrderID: { $first: "$OrderID" },
      CustomerID: { $first: "$CustomerID" },
      EmployeeID: { $first: "$EmployeeID" },
      OrderDate: { $first: "$OrderDate" },
      RequiredDate: { $first: "$RequiredDate" },
      Freight: { $first: "$Freight" },
      ShipVia: { $first: "$ShipVia" },
      ShipName: { $first: "$ShipName" },
      ShipAddress: { $first: "$ShipAddress" },
      ShipCity: { $first: "$ShipCity" },
      ShipCountry: { $first: "$ShipCountry" },
      Orderdetails: {
        $push: {
          UnitPrice: "$Orderdetails.UnitPrice",
          Quantity: "$Orderdetails.Quantity",
          Discount: "$Orderdetails.Discount",
          Value: "$Orderdetails.Value",
          product: "$Orderdetails.product"
        }
      }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },
  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "Employee"
    }
  },
  { $unwind: "$Employee" },
  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "Shipper"
    }
  },
  { $unwind: "$Shipper" },
  {
    $addFields: {
      OrderTotal: { $sum: "$Orderdetails.Value" }
    }
  },
  {
    $project: {
      _id: 0,
      OrderID: 1,
      Customer: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        City: "$Customer.City",
        Country: "$Customer.Country"
      },
      Employee: {
        EmployeeID: "$Employee.EmployeeID",
        FirstName: "$Employee.FirstName",
        LastName: "$Employee.LastName",
        Title: "$Employee.Title"
      },
      Dates: {
        OrderDate: "$OrderDate",
        RequiredDate: "$RequiredDate"
      },
      Orderdetails: 1,
      Freight: 1,
      OrderTotal: 1,
      Shipment: {
        Shipper: {
          ShipperID: "$Shipper.ShipperID",
          CompanyName: "$Shipper.CompanyName"
        },
        ShipName: "$ShipName",
        ShipAddress: "$ShipAddress",
        ShipCity: "$ShipCity",
        ShipCountry: "$ShipCountry"
      }
    }
  }
]).toArray()[0];

db.OrdersInfo.replaceOne({ OrderID: 99999 }, updatedOrder);
```

**Rezultat:**

```json
db.OrdersInfo.find({"OrderID" : 99999})

[
  {
    "_id": {"$oid": "682462d7ff8dc46c52559572"},
    "Customer": {
      "CustomerID": "ALFKI",
      "CompanyName": "Alfreds Futterkiste",
      "City": "Berlin",
      "Country": "Germany"
    },
    "Dates": {
      "OrderDate": {"$date": "1997-07-01T00:00:00.000Z"},
      "RequiredDate": {"$date": "1997-07-15T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 5,
      "FirstName": "Steven",
      "LastName": "Buchanan",
      "Title": "Sales Manager"
    },
    "Freight": 25,
    "OrderID": 99999,
    "OrderTotal": 151.05,
    "Orderdetails": [
      {
        "UnitPrice": 18,
        "Quantity": 5,
        "Discount": 0.2,
        "Value": 72,
        "product": {
          "ProductID": 1,
          "ProductName": "Chai",
          "QuantityPerUnit": "10 boxes x 20 bags",
          "CategoryID": 1,
          "CategoryName": "Beverages"
        }
      },
      {
        "UnitPrice": 31,
        "Quantity": 3,
        "Discount": 0.15000000000000002,
        "Value": 79.05,
        "product": {
          "ProductID": 10,
          "ProductName": "Ikura",
          "QuantityPerUnit": "12 - 200 ml jars",
          "CategoryID": 8,
          "CategoryName": "Seafood"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 1,
        "CompanyName": "Speedy Express"
      },
      "ShipName": "Alfreds Futterkiste",
      "ShipAddress": "Obere Str. 57",
      "ShipCity": "Berlin",
      "ShipCountry": "Germany"
    }
  }
]
```

#### Aktualizacja CustomerInfo

**Zapytanie:**

```js
delete updatedOrder.Customer;

db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  [
    {
      $set: {
        Orders: {
          $concatArrays: [
            {
              $filter: {
                input: "$Orders",
                as: "o",
                cond: { $ne: ["$$o.OrderID", 99999] }
              }
            },
            [updatedOrder]
          ]
        }
      }
    }
  ]
);
```

**Rezultat:**

```json
db.CustomerInfo.find({"CustomerID": "ALFKI"})

[
  {
    "_id": {"$oid": "682462b201d3c6ef851f898d"},
    "City": "Berlin",
    "CompanyName": "Alfreds Futterkiste",
    "Country": "Germany",
    "CustomerID": "ALFKI",
    "Orders": [
      {
        "OrderID": 10692,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-10-03T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-10-31T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 43.9,
            "Quantity": 20,
            "Discount": 0,
            "Value": 878,
            "product": {
              "ProductID": 63,
              "ProductName": "Vegie-spread",
              "QuantityPerUnit": "15 - 625 g jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 61.02,
        "OrderTotal": 878,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10952,
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-03-16T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-04-27T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 25,
            "Quantity": 16,
            "Discount": 0.05000000074505806,
            "Value": 379.9999997019768,
            "product": {
              "ProductID": 6,
              "ProductName": "Grandma's Boysenberry Spread",
              "QuantityPerUnit": "12 - 8 oz jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          },
          {
            "UnitPrice": 45.6,
            "Quantity": 2,
            "Discount": 0,
            "Value": 91.2,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Freight": 40.42,
        "OrderTotal": 471.19999970197676,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10702,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-10-13T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-11-24T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 10,
            "Quantity": 6,
            "Discount": 0,
            "Value": 60,
            "product": {
              "ProductID": 3,
              "ProductName": "Aniseed Syrup",
              "QuantityPerUnit": "12 - 550 ml bottles",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 15,
            "Discount": 0,
            "Value": 270,
            "product": {
              "ProductID": 76,
              "ProductName": "Lakkalikööri",
              "QuantityPerUnit": "500 ml",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Freight": 23.94,
        "OrderTotal": 330,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10643,
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-08-25T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-09-22T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 45.6,
            "Quantity": 15,
            "Discount": 0.25,
            "Value": 513,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 21,
            "Discount": 0.25,
            "Value": 283.5,
            "product": {
              "ProductID": 39,
              "ProductName": "Chartreuse verte",
              "QuantityPerUnit": "750 cc per bottle",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 12,
            "Quantity": 2,
            "Discount": 0.25,
            "Value": 18,
            "product": {
              "ProductID": 46,
              "ProductName": "Spegesild",
              "QuantityPerUnit": "4 - 450 g glasses",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "Freight": 29.46,
        "OrderTotal": 814.5,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfreds Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10835,
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-01-15T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-02-12T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 55,
            "Quantity": 15,
            "Discount": 0,
            "Value": 825,
            "product": {
              "ProductID": 59,
              "ProductName": "Raclette Courdavault",
              "QuantityPerUnit": "5 kg pkg.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          },
          {
            "UnitPrice": 13,
            "Quantity": 2,
            "Discount": 0.20000000298023224,
            "Value": 20.799999922513962,
            "product": {
              "ProductID": 77,
              "ProductName": "Original Frankfurter grüne Soße",
              "QuantityPerUnit": "12 boxes",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "Freight": 69.53,
        "OrderTotal": 845.799999922514,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 11011,
        "Employee": {
          "EmployeeID": 3,
          "FirstName": "Janet",
          "LastName": "Leverling",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-09T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-07T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 13.25,
            "Quantity": 40,
            "Discount": 0.05000000074505806,
            "Value": 503.4999996051192,
            "product": {
              "ProductID": 58,
              "ProductName": "Escargots de Bourgogne",
              "QuantityPerUnit": "24 pieces",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 21.5,
            "Quantity": 20,
            "Discount": 0,
            "Value": 430,
            "product": {
              "ProductID": 71,
              "ProductName": "Flotemysost",
              "QuantityPerUnit": "10 - 500 g pkgs.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          }
        ],
        "Freight": 1.21,
        "OrderTotal": 933.4999996051192,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 99999,
        "Freight": 25,
        "Orderdetails": [
          {
            "UnitPrice": 18,
            "Quantity": 5,
            "Discount": 0.2,
            "Value": 72,
            "product": {
              "ProductID": 1,
              "ProductName": "Chai",
              "QuantityPerUnit": "10 boxes x 20 bags",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 31,
            "Quantity": 3,
            "Discount": 0.15000000000000002,
            "Value": 79.05,
            "product": {
              "ProductID": 10,
              "ProductName": "Ikura",
              "QuantityPerUnit": "12 - 200 ml jars",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 5,
          "FirstName": "Steven",
          "LastName": "Buchanan",
          "Title": "Sales Manager"
        },
        "OrderTotal": 151.05,
        "Dates": {
          "OrderDate": {"$date": "1997-07-01T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-07-15T00:00:00.000Z"}
        },
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfreds Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      }
    ]
  }
]
```

# Zadanie 2 - modelowanie danych


Zaproponuj strukturę bazy danych dla przykładu:
- Firmy, wycieczki, osoby
	- Firmy organizują wycieczki
	- Osoby rezerwują miejsca/wykupują bilety
	- Osoby oceniają wycieczki
---

a) Zaproponuj  różne warianty struktury bazy danych i dokumentów w poszczególnych kolekcjach oraz przeprowadzić dyskusję każdego wariantu (wskazać wady i zalety każdego z wariantów)
- zdefiniuj schemat/reguły walidacji danych
- wykorzystaj referencje
- dokumenty zagnieżdżone
- tablice

b) Kolekcje należy wypełnić przykładowymi danymi

c) W kontekście zaprezentowania wad/zalet należy zaprezentować kilka przykładów/zapytań/operacji oraz dla których dedykowany jest dany wariant

W sprawozdaniu należy zamieścić przykładowe dokumenty w formacie JSON, oraz kod zapytań/operacji, wraz z odpowiednim komentarzem opisującym strukturę dokumentów oraz polecenia ilustrujące wykonanie przykładowych operacji na danych

Do sprawozdania należy kompletny zrzut wykonanych/przygotowanych baz danych (taki zrzut można wykonać np. za pomocą poleceń `mongoexport`, `mongdump` …) oraz plik z kodem operacji/zapytań w wersji źródłowej (np. plik .js, np. plik .md ), załącznik powinien mieć format zip

## Zadanie 2  - rozwiązanie

### **Uwaga schematy, przykładowe dane i kod zapytań wszystkich wariantów są w osobnych plikach md/js podliknowanych w odpowiednim miejscu.**

### Wariant 1: Kolekcje z referencjami

W tym wariancie postaram się tworzyć jak najmniej zagnieżdżeń i tworzyć jak najmniej zduplikowanych danych.

[Osobny dokumant](./wariant1.md)</br>
[Czyste komendy do przeklejenia](./wariant1.js)

```js
db.companies
{
  _id: ObjectId("..."),
  name: "Podróże Marzeń",
  description: "Biuro podróży specjalizujące się w wycieczkach egzotycznych",
  contactInfo: {
    email: "kontakt@podrozemarzen.pl",
    phone: "123456789",
    address: {
      street: "Turystyczna 10",
      city: "Warszawa",
      postalCode: "00-001"
    }
  },
  foundedYear: 2010,
  licenseNumber: "TUR/123/2010"
}

db.tours
{
  _id: ObjectId("..."),
  companyId: ObjectId("..."), // referencja do firmy
  title: "Wyprawa do Maroka",
  description: "Tygodniowa wycieczka objazdowa po Maroku",
  startDate: ISODate("2025-06-15"),
  endDate: ISODate("2025-06-22"),
  price: 3500,
  capacity: 20,
  reservationsCount: 12,
  destination: "Maroko",
  itinerary: [
    { day: 1, description: "Przylot do Marrakeszu, zakwaterowanie" },
    { day: 2, description: "Zwiedzanie Marrakeszu" }
    // więcej dni
  ],
  tags: ["Afryka", "zwiedzanie", "kultura"]
}

db.users
{
  _id: ObjectId("..."),
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan.kowalski@example.com",
  phone: "987654321",
  dateOfBirth: ISODate("1985-04-12"),
  registrationDate: ISODate("2023-01-15")
}

db.reservations
{
  _id: ObjectId("..."),
  userId: ObjectId("..."), // referencja do użytkownika
  tourId: ObjectId("..."), // referencja do wycieczki
  bookingDate: ISODate("2025-01-10"),
  status: "confirmed", // np. confirmed, cancelled, pending
  participantsCount: 2,
  totalPrice: 7000,
  paymentStatus: "paid", // np. paid, pending, partial
}

db.review
{
  _id: ObjectId("..."),
  userId: ObjectId("..."), // referencja do użytkownika
  tourId: ObjectId("..."), // referencja do wycieczki
  rating: 4.5, // skala 1-5
  comment: "Świetna organizacja i wspaniałe atrakcje!",
  createdAt: ISODate("2025-06-25")
}
```

Zalety:
- Łatwość aktualizacji - zmiana danych w jednej kolekcji nie wymaga aktualizacji innych
- Elastyczność - łatwo rozszerzyć kolekcje o nowe pola
- Normalizacja danych - unikamy redundancji danych

Wady:
- Wielokrotne lub złożone zapytania - potrzeba wykonać wiele zapytań (albo jedno skomplikowane) do pobrania pełnych informacji 
- Wydajność - operacje łączenia danych są niezbyt wydajne w MongoDB (w porównaniu do relacyjnych baz danych)


### Wariant 2 - Dokumenty zagnieżdżone

W tym wariancie skupimy się na minimalizacji liczby kolekcji i wykorzystaniu struktury dokumentowej MongoDB.

[Osobny dokumant](./wariant2.md)</br>
[Czyste komendy do przeklejenia](./wariant2.js)

```js
db.companies
{
  _id: ObjectId("..."),
  name: "Podróże Marzeń",
  description: "Biuro podróży specjalizujące się w wycieczkach egzotycznych",
  contactInfo: {
    email: "kontakt@podrozemarzen.pl",
    phone: "123456789",
    address: {
      street: "Turystyczna 10",
      city: "Warszawa",
      postalCode: "00-001"
    }
  },
  foundedYear: 2010,
  licenseNumber: "TUR/123/2010",
  tours: [
    {
      _id: ObjectId("..."),
      title: "Wyprawa do Maroka",
      description: "Tygodniowa wycieczka objazdowa po Maroku",
      startDate: ISODate("2025-06-15"),
      endDate: ISODate("2025-06-22"),
      price: 3500,
      capacity: 20,
      reservationsCount: 12,
      destination: "Maroko",
      itinerary: [
        { day: 1, description: "Przylot do Marrakeszu, zakwaterowanie" },
        { day: 2, description: "Zwiedzanie Marrakeszu" }
        // więcej dni
      ],
      tags: ["Afryka", "zwiedzanie", "kultura"],
      reviews: [
        {
          userId: ObjectId("..."),
          userName: "Jan Kowalski",
          rating: 4.5,
          comment: "Świetna organizacja i wspaniałe atrakcje!",
          createdAt: ISODate("2025-06-25")
        }
        // więcej ocen
      ]
    }
    // więcej wycieczek
  ]
}

db.users
{
  _id: ObjectId("..."),
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan.kowalski@example.com",
  phone: "987654321",
  dateOfBirth: ISODate("1985-04-12"),
  registrationDate: ISODate("2023-01-15"),
  reservations: [
    {
      tourId: ObjectId("..."),
      companyId: ObjectId("..."),
      tourTitle: "Wyprawa do Maroka",
      bookingDate: ISODate("2025-01-10"),
      startDate: ISODate("2025-06-15"),
      endDate: ISODate("2025-06-22"),
      status: "confirmed",
      participantsCount: 2,
      totalPrice: 7000,
      paymentStatus: "paid",
    }
    // więcej rezerwacji
  ],
  reviews: [
    {
      tourId: ObjectId("..."),
      companyId: ObjectId("..."),
      tourTitle: "Wyprawa do Maroka",
      rating: 4.5,
      comment: "Świetna organizacja i wspaniałe atrakcje!",
      createdAt: ISODate("2025-06-25")
    }
    // więcej ocen
  ]
}
```

Zalety:
- Wydajność odczytu - wszystkie powiązane dane dostępne są w jedym zapytaniu
- Mniej operacji łączenia - dane są już zagnieżdżone w strukturze dokumentu
- Łatwość atomowych aktualizacji - zmiana niektórych danych jest szybka i wygodna

Wady:
- Duplikacja danych - część informacji jest powielana (np. nazwy wycieczek w rezerwacjach)
- Nieatomowe aktualizacje - zmiana niektórych danych wymaga aktualizacji w wielu miejscach
- Złożone zapytania na danych zagnieżdżonych - dostęp do danych zagnieżdzonych jest często bardzo zawiły i wymaga długich zapytań aby się do nich dostać



### Wariant 3 - Rozwiązanie hybrydowe

[Osobny dokumant](./wariant3.md)<br/>
[Czyste komendy do przeklejenia](./wariant3.js)

```js
db.companies
{
  _id: ObjectId("..."),
  name: "Podróże Marzeń",
  description: "Biuro podróży specjalizujące się w wycieczkach egzotycznych",
  contactInfo: {
    email: "kontakt@podrozemarzen.pl",
    phone: "123456789",
    address: {
      street: "Turystyczna 10",
      city: "Warszawa",
      postalCode: "00-001"
    }
  },
  foundedYear: 2010,
  licenseNumber: "TUR/123/2010"
}

db.tours
{
  _id: ObjectId("..."),
  companyId: ObjectId("..."), // referencja do firmy
  companyName: "Podróże Marzeń", // denormalizacja dla szybkiego dostępu
  title: "Wyprawa do Maroka",
  description: "Tygodniowa wycieczka objazdowa po Maroku",
  startDate: ISODate("2025-06-15"),
  endDate: ISODate("2025-06-22"),
  price: 3500,
  capacity: 20,
  reservationsCount: 12,
  destination: "Maroko",
  itinerary: [
    { day: 1, description: "Przylot do Marrakeszu, zakwaterowanie" },
    { day: 2, description: "Zwiedzanie Marrakeszu" }
    // więcej dni
  ],
  tags: ["Afryka", "zwiedzanie", "kultura"],
  reviews: [
    {
      userId: ObjectId("..."),
      userName: "Jan Kowalski", // denormalizacja dla szybkiego dostępu
      rating: 4.5,
      comment: "Świetna organizacja i wspaniałe atrakcje!",
      createdAt: ISODate("2025-06-25")
    }
    // więcej ocen
  ],
  averageRating: 4.5 // przeliczona średnia ocen
}

db.user
{
  _id: ObjectId("..."),
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan.kowalski@example.com",
  phone: "987654321",
  dateOfBirth: ISODate("1985-04-12"),
  registrationDate: ISODate("2023-01-15"),
  reservationCount: 5, // liczba rezerwacji dla szybkiego dostępu
  reviewCount: 3 // liczba ocen dla szybkiego dostępu
}

db.reservation
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  userName: "Jan Kowalski", // denormalizacja
  tourId: ObjectId("..."),
  tourTitle: "Wyprawa do Maroka", // denormalizacja
  companyId: ObjectId("..."),
  companyName: "Podróże Marzeń", // denormalizacja
  bookingDate: ISODate("2025-01-10"),
  tourDates: {
    startDate: ISODate("2025-06-15"),
    endDate: ISODate("2025-06-22")
  },
  status: "confirmed",
  participantsCount: 2,
  totalPrice: 7000,
  paymentStatus: "paid",
  specialRequests: "Pokój z widokiem na morze"
}
```

Zalety:
- Zbalansowana wydajność - efektywny odczyt bez zbyt dużej redundancji
- Ograniczona duplikacja - denormalizujemy tylko najważniejsze dane
- Łatwiejsza aktualizacja - główne dane aktualizowane w jednym miejscu

Wady:

- Umiarkowana złożoność - niekiedy wymaga używania złożonych zapytań
- Częściowa duplikacja - wymaga aktualizacji zduplikowanych danych


## Wnioski

Wszystkie trzy warianty mają swoje mocne i słabe strony. Wybór który wariant jest najlepszy zależy od kilku czynników:
- Jeśli dane są znacznie częściej czytane niż aktualizowane i wydajność odczytu jest ważna to **Wariant dokumentowy** jest najlepszy,
- Jeśli system jest często aktualizowany, dane są mocno powiązane i jest ich bardzo dużo, a wydajność odczytu nie jest ważna to **Wariant referencyjny** jest najlepszy,
- Jeśli system wymaga czegoś pomiędzy, w miarę szybkiego odczytu, nie za dużej redundancji i (zazwyczaj) łatwych aktualizacji to **Wariant hybrydowy** jest najlepszy.
---

Punktacja:

|         |     |
| ------- | --- |
| zadanie | pkt |
| 1       | 1   |
| 2       | 1   |
| razem   | 2   |



