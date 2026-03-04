import javax.persistence.Entity; 
import javax.persistence.GeneratedValue; 
import javax.persistence.GenerationType; 
import javax.persistence.Id; 
import javax.persistence.Column; 

@Entity 
public class Member { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 

    @Column(nullable = false, length = 100) 
    private String name; 

    @Column(nullable = false, unique = true, length = 100) 
    private String email; 

    @Column(nullable = false, length = 20) 
    private String phoneNumber; 

    @Column(nullable = false, length = 50) 
    private String membershipType; 

    private String address; 

    public Member() {} 

    public Member(String name, String email, String phoneNumber, String membershipType) { 
        this.name = name; 
        this.email = email; 
        this.phoneNumber = phoneNumber; 
        this.membershipType = membershipType; 
    } 

    public Long getId() { 
        return id; 
    } 

    public void setId(Long id) { 
        this.id = id; 
    } 

    public String getName() { 
        return name; 
    } 

    public void setName(String name) { 
        this.name = name; 
    } 

    public String getEmail() { 
        return email; 
    } 

    public void setEmail(String email) { 
        this.email = email; 
    } 

    public String getPhoneNumber() { 
        return phoneNumber; 
    } 

    public void setPhoneNumber(String phoneNumber) { 
        this.phoneNumber = phoneNumber; 
    } 

    public String getMembershipType() { 
        return membershipType; 
    } 

    public void setMembershipType(String membershipType) { 
        this.membershipType = membershipType; 
    } 

    public String getAddress() { 
        return address; 
    } 

    public void setAddress(String address) { 
        this.address = address; 
    } 
}