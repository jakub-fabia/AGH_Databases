public class Program
{
    public static void Main()
    {
        ProdContext productContext = new ProdContext();
        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("1 - Create Company");
            Console.WriteLine("2 - View Companies");
            Console.WriteLine("3 - Exit");
            Console.WriteLine("Select an option:");
            string option = Console.ReadLine();
            switch (option)
            {
                case "1":
                    createCompany(productContext);
                    Thread.Sleep(1000);
                    break;
                case "2":
                    viewCompanies(productContext);
                    Thread.Sleep(1000);
                    break;
                case "3":
                    return;
                default:
                    Console.WriteLine("Invalid option. Please try again.");
                    break;
            }
        }
    }
    private static void createCompany(ProdContext productContext)
    {
        Console.WriteLine("Enter Company Name:");
        string companyName = Console.ReadLine();
        Console.WriteLine("Enter Street:");
        string street = Console.ReadLine();
        Console.WriteLine("Enter City:");
        string city = Console.ReadLine();
        Console.WriteLine("Enter Zip:");
        string zip = Console.ReadLine();
        Console.WriteLine("Choose Company Type:");
        Console.WriteLine("1 - Customer");
        Console.WriteLine("2 - Supplier");
        string companyType = Console.ReadLine();
        if (companyType != "1" && companyType != "2")
        {
            Console.WriteLine("Invalid company type. Please try again.");
            return;
        }
        if (companyType == "1")
        {
            Console.WriteLine("Enter Discount:");
            int discount = Convert.ToInt32(Console.ReadLine());
            Customer customer = new Customer
            {
                CompanyName = companyName,
                Street = street,
                City = city,
                Zip = zip,
                Discount = discount
            };
            productContext.Companies.Add(customer);
        }
        else
        {
            Console.WriteLine("Enter Bank Account Number:");
            string bankAccNum = Console.ReadLine();
            Supplier supplier = new Supplier
            {
                CompanyName = companyName,
                Street = street,
                City = city,
                Zip = zip,
                bankAccountNumber = bankAccNum
            };
            productContext.Companies.Add(supplier);
        }
        productContext.SaveChanges();
        Console.WriteLine("Company created successfully.");
    }
    private static void viewCompanies(ProdContext productContext)
    {
        Console.WriteLine("Choose type of companies:");
        Console.WriteLine("1 - Customers");
        Console.WriteLine("2 - Suppliers");
        Console.WriteLine("Else - All Companies");
        string companyType = Console.ReadLine();
        if (companyType == "1")
        {
            foreach (var customer in productContext.Customers)
            {
                Console.WriteLine(customer);
            }
        }
        else if (companyType == "2")
        {
            foreach (var supplier in productContext.Suppliers)
            {
                Console.WriteLine(supplier);
            }
        }
        else
        {
            foreach (var company in productContext.Companies)
            {
                Console.WriteLine(company);
            }
        }
    }
}