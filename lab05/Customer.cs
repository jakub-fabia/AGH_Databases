using System.ComponentModel.DataAnnotations.Schema;

[Table("Customers")]
public class Customer : Company
{
    public int Discount { get; set; }

    public override string ToString()
    {
        return $"{CompanyName} - {Street}, {City}, {Zip} (Discount: {Discount}%)";
    }
}