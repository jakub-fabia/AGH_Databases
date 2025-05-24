public class Program
{
    public static void Main()
    {
        ProdContext productContext = new ProdContext();
        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("1 - Create Product");
            Console.WriteLine("2 - View Products");
            Console.WriteLine("3 - Place Order");
            Console.WriteLine("4 - View Orders");
            Console.WriteLine("5 - Exit");
            Console.WriteLine("Select an option:");
            string option = Console.ReadLine();
            switch (option)
            {
                case "1":
                    createProduct(productContext);
                    Thread.Sleep(1000);
                    break;
                case "2":
                    viewProducts(productContext);
                    Thread.Sleep(1000);
                    break;
                case "3":
                    placeOrder(productContext);
                    Thread.Sleep(1000);
                    break;
                case "4":
                    ViewOrders(productContext);
                    Thread.Sleep(1000);
                    break;
                case "5":
                    return;
                default:
                    Console.WriteLine("Invalid option. Please try again.");
                    break;
            }
        }
    }
    private static void createProduct(ProdContext productContext)
    {
        Console.WriteLine("Input product name:");
        string ProductName = Console.ReadLine();
        Console.WriteLine("Input product units in stock:");
        int UnitsInStock = Convert.ToInt32(Console.ReadLine());
        productContext.Products.Add(new Product { ProductName = ProductName, UnitsInStock = UnitsInStock });
        productContext.SaveChanges();
    }
    private static void viewProducts(ProdContext productContext)
    {
        var productsQuery = from prod in productContext.Products select prod;
        Console.WriteLine();
        Console.WriteLine("Products List:");
        foreach (var pName in productsQuery)
        {
            Console.WriteLine(pName);
        }
    }
    private static void placeOrder(ProdContext productContext)
    {
        Invoice invoice = new Invoice();
        invoice.InvoiceDetails = new List<InvoiceDetail>();
        bool continueAdding = true;
        while (continueAdding)
        {
            Console.WriteLine("Input product ID:");
            int productID = Convert.ToInt32(Console.ReadLine());
            Product? product = productContext.Products.Find(productID);
            if (product == null)
            {
                Console.WriteLine("Product not found.");
                return;
            }
            Console.WriteLine("Input quantity:");
            int quantity = Convert.ToInt32(Console.ReadLine());
            if (quantity > product.UnitsInStock)
            {
                Console.WriteLine("Insufficient stock.");
                return;
            }
            InvoiceDetail invoiceDetail = new InvoiceDetail
            {
                InvoiceID = invoice.InvoiceID,
                ProductID = product.ProductID,
                Quantity = quantity
            };
            productContext.InvoiceDetails.Add(invoiceDetail);
            product.UnitsInStock -= quantity;
            product.InvoiceDetails.Add(invoiceDetail);
            productContext.Products.Update(product);
            invoice.InvoiceDetails.Add(invoiceDetail);
            Console.WriteLine("Do you want to add another product to the invoice? (y/[n]):");
            string option = Console.ReadLine();
            if (option.ToLower() != "y")
            {
                continueAdding = false;
                break;
            }
        }

        productContext.Invoices.Add(invoice);
        productContext.SaveChanges();
    }
    private static void ViewOrders(ProdContext productContext)
    {
        var detailsQuery = from det in productContext.InvoiceDetails
                           select new { det.InvoiceID, det.Product.ProductName, det.Quantity };
        Console.WriteLine();
        Console.WriteLine("Invoices List:");
        foreach (var detail in detailsQuery)
        {
            Console.WriteLine(detail);
        }
    }
}