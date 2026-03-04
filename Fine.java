import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Fine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long borrowRecordId;
    private double amount;
    private LocalDateTime fineDate;
    private boolean isPaid;

    public Fine() {}

    public Fine(Long borrowRecordId, double amount) {
        this.borrowRecordId = borrowRecordId;
        this.amount = amount;
        this.fineDate = LocalDateTime.now();
        this.isPaid = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBorrowRecordId() { return borrowRecordId; }
    public void setBorrowRecordId(Long borrowRecordId) { this.borrowRecordId = borrowRecordId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public LocalDateTime getFineDate() { return fineDate; }
    public void setFineDate(LocalDateTime fineDate) { this.fineDate = fineDate; }
    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }
}