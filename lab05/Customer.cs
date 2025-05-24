public class Customer : Company
{
    public int CustomerId { get; set; }
    public int Discount { get; set; }

    public override string ToString()
    {
        return $"{CompanyName} - {Street}, {City}, {Zip} (Discount: {Discount}%)";
    }
}