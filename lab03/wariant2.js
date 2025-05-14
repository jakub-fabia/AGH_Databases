db.createCollection("companies", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "contactInfo", "tours"],
        properties: {
          name: { bsonType: "string" },
          description: { bsonType: "string" },
          contactInfo: {
            bsonType: "object",
            required: ["email", "phone"],
            properties: {
              email: { bsonType: "string" },
              phone: { bsonType: "string" },
              address: {
                bsonType: "object",
                properties: {
                  street: { bsonType: "string" },
                  city: { bsonType: "string" },
                  postalCode: { bsonType: "string" }
                }
              }
            }
          },
          foundedYear: { bsonType: "int" },
          licenseNumber: { bsonType: "string" },
          tours: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["title", "startDate", "endDate", "price", "capacity"],
              properties: {
                _id: { bsonType: "objectId" },
                title: { bsonType: "string" },
                description: { bsonType: "string" },
                startDate: { bsonType: "date" },
                endDate: { bsonType: "date" },
                price: { bsonType: "number" },
                capacity: { bsonType: "int" },
                reservationsCount: { bsonType: "int" },
                destination: { bsonType: "string" },
                itinerary: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    properties: {
                      day: { bsonType: "int" },
                      description: { bsonType: "string" }
                    }
                  }
                },
                tags: {
                  bsonType: "array",
                  items: { bsonType: "string" }
                },
                reviews: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    properties: {
                      userId: { bsonType: "objectId" },
                      userName: { bsonType: "string" },
                      rating: { bsonType: "number" },
                      comment: { bsonType: "string" },
                      createdAt: { bsonType: "date" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  
  // Kolekcja 'users' - użytkownicy z zagnieżdżonymi rezerwacjami i ocenami
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["firstName", "lastName", "email"],
        properties: {
          firstName: { bsonType: "string" },
          lastName: { bsonType: "string" },
          email: { bsonType: "string" },
          phone: { bsonType: "string" },
          dateOfBirth: { bsonType: "date" },
          registrationDate: { bsonType: "date" },
          reservations: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["tourId", "companyId", "bookingDate", "status"],
              properties: {
                tourId: { bsonType: "objectId" },
                companyId: { bsonType: "objectId" },
                tourTitle: { bsonType: "string" },
                bookingDate: { bsonType: "date" },
                startDate: { bsonType: "date" },
                endDate: { bsonType: "date" },
                status: { bsonType: "string" },
                participantsCount: { bsonType: "int" },
                totalPrice: { bsonType: "number" },
                paymentStatus: { bsonType: "string" },
                specialRequests: { bsonType: "string" }
              }
            }
          },
          reviews: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["tourId", "companyId", "rating"],
              properties: {
                tourId: { bsonType: "objectId" },
                companyId: { bsonType: "objectId" },
                tourTitle: { bsonType: "string" },
                rating: { bsonType: "number" },
                comment: { bsonType: "string" },
                createdAt: { bsonType: "date" }
              }
            }
          }
        }
      }
    }
  });
  
  
  const company1Id = ObjectId();
  const tour1Id = ObjectId();
  const tour2Id = ObjectId();
  const user1Id = ObjectId();
  const user2Id = ObjectId();
  
  
  db.companies.insertMany([
    {
      _id: company1Id,
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
          _id: tour1Id,
          title: "Wyprawa do Maroka",
          description: "Tygodniowa wycieczka objazdowa po Maroku",
          startDate: new Date("2025-06-15"),
          endDate: new Date("2025-06-22"),
          price: 3500,
          currency: "PLN",
          capacity: 20,
          reservationsCount: 12,
          destination: "Maroko",
          itinerary: [
            { day: 1, description: "Przylot do Marrakeszu, zakwaterowanie" },
            { day: 2, description: "Zwiedzanie Marrakeszu" },
            { day: 3, description: "Wyjazd do Fezu" },
            { day: 4, description: "Zwiedzanie Fezu" },
            { day: 5, description: "Przejazd do Casablanki" },
            { day: 6, description: "Zwiedzanie Casablanki" },
            { day: 7, description: "Powrót do kraju" }
          ],
          tags: ["Afryka", "zwiedzanie", "kultura"],
          reviews: []
        },
        {
          _id: tour2Id,
          title: "Wycieczka na Bali",
          description: "Dwutygodniowy relaks na rajskiej wyspie",
          startDate: new Date("2025-07-10"),
          endDate: new Date("2025-07-24"),
          price: 6000,
          currency: "PLN",
          capacity: 15,
          reservationsCount: 8,
          destination: "Indonezja",
          itinerary: [
            { day: 1, description: "Przylot na Bali, transfer do hotelu" },
            { day: 2, description: "Odpoczynek na plaży" },
            { day: 3, description: "Wycieczka do świątyni Uluwatu" }
          ],
          tags: ["Azja", "plaża", "relaks", "świątynie"],
          reviews: []
        }
      ]
    },
    {
      _id: ObjectId(),
      name: "Aktywne Wakacje",
      description: "Biuro specjalizujące się w wyprawach górskich i trekkingach",
      contactInfo: {
        email: "info@aktywnewakacje.pl",
        phone: "987654321",
        address: {
          street: "Górska 5",
          city: "Kraków",
          postalCode: "30-001"
        }
      },
      foundedYear: 2015,
      licenseNumber: "TUR/456/2015",
      tours: [
        {
          _id: ObjectId(),
          title: "Trekking w Himalajach",
          description: "Dwutygodniowa wyprawa trekkingowa w Himalajach nepalskich",
          startDate: new Date("2025-09-01"),
          endDate: new Date("2025-09-15"),
          price: 8500,
          currency: "PLN",
          capacity: 10,
          reservationsCount: 6,
          destination: "Nepal",
          itinerary: [
            { day: 1, description: "Przylot do Katmandu" },
            { day: 2, description: "Aklimatyzacja i przygotowania" }
          ],
          tags: ["góry", "trekking", "przygoda", "Azja"],
          reviews: []
        }
      ]
    }
  ]);
  
  
  db.users.insertMany([
    {
      _id: user1Id,
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      phone: "987654321",
      dateOfBirth: new Date("1985-04-12"),
      registrationDate: new Date("2023-01-15"),
      reservations: [
        {
          tourId: tour1Id,
          companyId: company1Id,
          tourTitle: "Wyprawa do Maroka",
          bookingDate: new Date("2025-01-10"),
          startDate: new Date("2025-06-15"),
          endDate: new Date("2025-06-22"),
          status: "confirmed",
          participantsCount: 2,
          totalPrice: 7000,
          paymentStatus: "paid",
          specialRequests: "Pokój z widokiem na morze"
        }
      ],
      reviews: []
    },
    {
      _id: user2Id,
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@example.com",
      phone: "123123123",
      dateOfBirth: new Date("1990-07-22"),
      registrationDate: new Date("2022-11-05"),
      reservations: [
        {
          tourId: tour1Id,
          companyId: company1Id,
          tourTitle: "Wyprawa do Maroka",
          bookingDate: new Date("2025-02-15"),
          startDate: new Date("2025-06-15"),
          endDate: new Date("2025-06-22"),
          status: "confirmed",
          participantsCount: 1,
          totalPrice: 3500,
          paymentStatus: "paid",
          specialRequests: ""
        },
        {
          tourId: tour2Id,
          companyId: company1Id,
          tourTitle: "Wycieczka na Bali",
          bookingDate: new Date("2025-03-10"),
          startDate: new Date("2025-07-10"),
          endDate: new Date("2025-07-24"),
          status: "pending",
          participantsCount: 2,
          totalPrice: 12000,
          paymentStatus: "deposit",
          specialRequests: "Pokój z widokiem na ocean, blisko plaży"
        }
      ],
      reviews: []
    }
  ]);
  
  
  db.users.updateOne(
    { _id: user1Id },
    {
      $push: {
        reviews: {
          tourId: tour1Id,
          companyId: company1Id,
          tourTitle: "Wyprawa do Maroka",
          rating: 4.5,
          comment: "Świetna organizacja i wspaniałe atrakcje!",
          createdAt: new Date("2025-06-25")
        }
      }
    }
  );
  
  // Dodanie tej samej oceny do wycieczki w kolekcji firms
  db.companies.updateOne(
    {
      _id: company1Id,
      "tours._id": tour1Id
    },
    {
      $push: {
        "tours.$.reviews": {
          userId: user1Id,
          userName: "Jan Kowalski",
          rating: 4.5,
          comment: "Świetna organizacja i wspaniałe atrakcje!",
          createdAt: new Date("2025-06-25")
        }
      }
    }
  );
  
  
  db.companies.findOne({ _id: company1Id });
  
  
  db.users.findOne(
    { _id: user2Id },
    { firstName: 1, lastName: 1, reservations: 1 }
  );
  
  db.companies.find(
    { "tours.destination": "Maroko" },
    { name: 1, "tours.$": 1 }
  );
  
  db.users.find(
    { "reservations.tourId": tour1Id },
    { firstName: 1, lastName: 1, "reservations.$": 1 }
  );
  
  db.companies.updateOne(
    { "tours._id": tour1Id },
    { $inc: { "tours.$.reservationsCount": 1 } }
  );
  
  db.companies.updateOne(
    { "tours._id": tour2Id },
    {
      $push: {
        "tours.$.itinerary": {
          day: 4,
          description: "Wycieczka do świątyni Besakih"
        }
      }
    }
  );
  
  db.companies.updateOne(
    { "tours._id": tour1Id },
    { $set: { "tours.$.title": "Magiczne Maroko - wycieczka objazdowa" } }
  );
  
  db.users.updateMany(
    { "reservations.tourId": tour1Id },
    { $set: { "reservations.$.tourTitle": "Magiczne Maroko - wycieczka objazdowa" } }
  );
  
  
  db.users.updateMany(
    { "reviews.tourId": tour1Id },
    { $set: { "reviews.$.tourTitle": "Magiczne Maroko - wycieczka objazdowa" } }
  );
  
  
  db.companies.aggregate([
    { $unwind: "$tours" },
    { $match: {
        "tours.price": { $lt: 4000 },
        "tours.startDate": {
          $gte: new Date("2025-06-01"),
          $lt: new Date("2025-07-01")
        },
        "tours.tags": { $all: ["kultura", "zwiedzanie"] }
      }
    },
    { $project: {
        _id: 0,
        companyName: "$name",
        tourId: "$tours._id",
        tourTitle: "$tours.title",
        price: "$tours.price",
        startDate: "$tours.startDate",
        tags: "$tours.tags"
      }
    }
  ]);
  