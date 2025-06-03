db.createCollection("companies", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "description", "contactInfo", "foundedYear", "licenseNumber"],
        properties: {
          name: { bsonType: "string" },
          description: { bsonType: "string" },
          contactInfo: {
            bsonType: "object",
            required: ["email", "phone", "address"],
            properties: {
              email: { bsonType: "string" },
              phone: { bsonType: "string" },
              address: {
                bsonType: "object",
                required: ["street", "city", "postalCode"],
                properties: {
                  street: { bsonType: "string" },
                  city: { bsonType: "string" },
                  postalCode: { bsonType: "string" }
                }
              }
            }
          },
          foundedYear: { bsonType: "int" },
          licenseNumber: { bsonType: "string" }
        }
      }
    }
  });
  
  db.createCollection("tours", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["companyId", "companyName", "title", "startDate", "endDate", "price", "currency", "capacity", "reviews"],
        properties: {
          companyId: { bsonType: "objectId" },
          companyName: { bsonType: "string" },
          title: { bsonType: "string" },
          description: { bsonType: "string" },
          startDate: { bsonType: "date" },
          endDate: { bsonType: "date" },
          price: { bsonType: "int" },
          capacity: { bsonType: "int" },
          reservationsCount: { bsonType: "int" },
          destination: { bsonType: "string" },
          itinerary: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["day", "description"],
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
              required: ["userId", "userName", "rating", "createdAt"],
              properties: {
                userId: { bsonType: "objectId" },
                userName: { bsonType: "string" },
                rating: { bsonType: "double" },
                comment: { bsonType: "string" },
                createdAt: { bsonType: "date" }
              }
            }
          },
          averageRating: { bsonType: "double" }
        }
      }
    }
  });
  
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["firstName", "lastName", "email", "phone", "dateOfBirth", "registrationDate"],
        properties: {
          firstName: { bsonType: "string" },
          lastName: { bsonType: "string" },
          email: { bsonType: "string" },
          phone: { bsonType: "string" },
          dateOfBirth: { bsonType: "date" },
          registrationDate: { bsonType: "date" },
          reservationCount: { bsonType: "int" },
          reviewCount: { bsonType: "int" }
        }
      }
    }
  });
  
  db.createCollection("reservations", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "userName", "tourId", "tourTitle", "companyId", "companyName", "bookingDate", "tourDates", "status", "participantsCount", "totalPrice", "paymentStatus"],
        properties: {
          userId: { bsonType: "objectId" },
          userName: { bsonType: "string" },
          tourId: { bsonType: "objectId" },
          tourTitle: { bsonType: "string" },
          companyId: { bsonType: "objectId" },
          companyName: { bsonType: "string" },
          bookingDate: { bsonType: "date" },
          tourDates: {
            bsonType: "object",
            required: ["startDate", "endDate"],
            properties: {
              startDate: { bsonType: "date" },
              endDate: { bsonType: "date" }
            }
          },
          status: { enum: ["confirmed", "pending", "cancelled"] },
          participantsCount: { bsonType: "int" },
          totalPrice: { bsonType: "int" },
          paymentStatus: { enum: ["paid", "unpaid", "refunded"] },
          specialRequests: { bsonType: "string" }
        }
      }
    }
  });
  
  
  
  const companyId = ObjectId();
  const user1Id = ObjectId();
  const user2Id = ObjectId();
  const tour1Id = ObjectId();
  const tour2Id = ObjectId();
  
  
  db.companies.insertOne({
    _id: companyId,
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
  });
  
  
  db.users.insertMany([
    {
      _id: user1Id,
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      phone: "987654321",
      dateOfBirth: ISODate("1985-04-12"),
      registrationDate: ISODate("2023-01-15"),
      reservationCount: 1,
      reviewCount: 1
    },
    {
      _id: user2Id,
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@example.com",
      phone: "123123123",
      dateOfBirth: ISODate("1990-07-22"),
      registrationDate: ISODate("2023-03-20"),
      reservationCount: 1,
      reviewCount: 1
    }
  ]);
  
  
  db.tours.insertMany([
    {
      _id: tour1Id,
      companyId: companyId,
      companyName: "Podróże Marzeń",
      title: "Wyprawa do Maroka",
      description: "Tygodniowa wycieczka objazdowa po Maroku",
      startDate: ISODate("2025-06-15"),
      endDate: ISODate("2025-06-22"),
      price: 3500,
      currency: "PLN",
      capacity: 20,
      reservationsCount: 1,
      destination: "Maroko",
      itinerary: [
        { day: 1, description: "Przylot do Marrakeszu, zakwaterowanie" },
        { day: 2, description: "Zwiedzanie Marrakeszu" }
      ],
      tags: ["Afryka", "zwiedzanie", "kultura"],
      reviews: [
        {
          userId: user1Id,
          userName: "Jan Kowalski",
          rating: 4.5,
          comment: "Świetna organizacja!",
          createdAt: ISODate("2025-06-25")
        }
      ],
      averageRating: 4.5
    },
    {
      _id: tour2Id,
      companyId: companyId,
      companyName: "Podróże Marzeń",
      title: "Safari w Kenii",
      description: "Niezapomniana przygoda z dziką przyrodą Afryki",
      startDate: ISODate("2025-07-05"),
      endDate: ISODate("2025-07-15"),
      price: 5000,
      currency: "PLN",
      capacity: 15,
      reservationsCount: 1,
      destination: "Kenia",
      itinerary: [
        { day: 1, description: "Przylot do Nairobi, odpoczynek" },
        { day: 2, description: "Safari w Masai Mara" }
      ],
      tags: ["safari", "dzika przyroda", "Afryka"],
      reviews: [
        {
          userId: user2Id,
          userName: "Anna Nowak",
          rating: 4.7,
          comment: "Cudowne przeżycie!",
          createdAt: ISODate("2025-07-20")
        }
      ],
      averageRating: 4.7
    }
  ])
  
  db.reservations.insertMany([
    {
      userId: user1Id,
      userName: "Jan Kowalski",
      tourId: tour1Id,
      tourTitle: "Wyprawa do Maroka",
      companyId: companyId,
      companyName: "Podróże Marzeń",
      bookingDate: ISODate("2025-01-10"),
      tourDates: {
        startDate: ISODate("2025-06-15"),
        endDate: ISODate("2025-06-22")
      },
      status: "confirmed",
      participantsCount: 2,
      totalPrice: 7000,
      paymentStatus: "paid",
      specialRequests: "Pokój z widokiem na góry"
    },
    {
      userId: user2Id,
      userName: "Anna Nowak",
      tourId: tour2Id,
      tourTitle: "Safari w Kenii",
      companyId: companyId,
      companyName: "Podróże Marzeń",
      bookingDate: ISODate("2025-01-20"),
      tourDates: {
        startDate: ISODate("2025-07-05"),
        endDate: ISODate("2025-07-15")
      },
      status: "confirmed",
      participantsCount: 1,
      totalPrice: 5000,
      paymentStatus: "paid",
      specialRequests: "Wegańskie posiłki"
    }
  ]);
  
  
  db.reservations.find({}, {
    userName: 1,
    tourTitle: 1,
    companyName: 1,
    bookingDate: 1,
    totalPrice: 1
  });
  
  
  db.tours.find({}, {
    companyName: 1,
    title: 1
  });
  
  
  db.companies.updateOne(
    { name: "Podróże Marzeń" },
    { $set: { licenseNumber: "TUR/456/2025" } }
  );
  
  
  db.reservations.aggregate([
    {
      $lookup: {
        from: "companies",
        localField: "companyId",
        foreignField: "_id",
        as: "companyData"
      }
    },
    { $unwind: "$companyData" },
    {
      $project: {
        userName: 1,
        tourTitle: 1,
        companyName: "$companyData.name",
        companyEmail: "$companyData.contactInfo.email"
      }
    }
  ]);
  
  
  
  db.users.updateOne(
    { _id: user1Id },
    { $set: { lastName: "Nowy" } }
  );
  
  
  db.tours.updateMany(
    { "reviews.userId": user1Id },
    { $set: { "reviews.$[elem].userName": "Jan Nowy" } },
    { arrayFilters: [ { "elem.userId": user1Id } ] }
  );
  
  
  db.reservations.updateMany(
    { userId: user1Id },
    { $set: { userName: "Jan Nowy" } }
  );