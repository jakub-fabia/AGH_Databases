using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
class InvoiceDetail
{
    [Key, Column(Order = 0)]
    public int InvoiceID { get; set; }

    [Key, Column(Order = 1)]
    public int ProductID { get; set; }

    public virtual Invoice Invoice { get; set; }
    public virtual Product Product { get; set; }

    public int Quantity { get; set; }

    public override string ToString()
    {
        return $"{Product} {Quantity}";
    }
}