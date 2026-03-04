import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Custom Types
  type Book = {
    id : Nat;
    title : Text;
    author : Text;
    isbn : Text;
    genre : Text;
    yearPublished : Nat;
    totalQuantity : Nat;
    availableQuantity : Nat;
  };

  module Book {
    public func compare(book1 : Book, book2 : Book) : Order.Order {
      Nat.compare(book1.id, book2.id);
    };

    public func compareByAvailableQuantity(book1 : Book, book2 : Book) : Order.Order {
      Nat.compare(book1.availableQuantity, book2.availableQuantity);
    };
  };

  type Member = {
    id : Nat;
    name : Text;
    email : Text;
    memberType : { #student; #faculty; #external };
    joinDate : Time.Time;
  };

  module Member {
    public func compare(member1 : Member, member2 : Member) : Order.Order {
      Nat.compare(member1.id, member2.id);
    };
  };

  type BorrowRecord = {
    id : Nat;
    memberId : Nat;
    bookId : Nat;
    borrowDate : Time.Time;
    dueDate : Time.Time;
    returnDate : ?Time.Time;
    fineAmount : Nat;
  };

  type Recommendation = {
    bookId : Nat;
    title : Text;
    author : Text;
    genre : Text;
    genreScore : Nat;
  };

  type DashboardStats = {
    totalBooks : Nat;
    totalMembers : Nat;
    activeLoans : Nat;
    overdueLoans : Nat;
    totalFines : Nat;
    mostBorrowedBooks : [Book];
    recentlyAddedBooks : [Book];
  };

  public type UserProfile = {
    name : Text;
    memberId : ?Nat;
  };

  // State
  var nextBookId = 1;
  var nextMemberId = 1;
  var nextBorrowId = 1;

  let books = Map.empty<Nat, Book>();
  let members = Map.empty<Nat, Member>();
  let borrowRecords = Map.empty<Nat, BorrowRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToMemberId = Map.empty<Principal, Nat>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Book Management
  public shared ({ caller }) func addBook(title : Text, author : Text, isbn : Text, genre : Text, yearPublished : Nat, quantity : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };

    let book : Book = {
      id = nextBookId;
      title;
      author;
      isbn;
      genre;
      yearPublished;
      totalQuantity = quantity;
      availableQuantity = quantity;
    };

    books.add(nextBookId, book);
    nextBookId += 1;
    book.id;
  };

  public shared ({ caller }) func updateBook(id : Nat, title : Text, author : Text, isbn : Text, genre : Text, yearPublished : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };
    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?existingBook) {
        if (quantity < existingBook.totalQuantity - existingBook.availableQuantity) {
          Runtime.trap("Total quantity cannot be less than borrowed copies");
        };
        let updatedBook : Book = {
          id;
          title;
          author;
          isbn;
          genre;
          yearPublished;
          totalQuantity = quantity;
          availableQuantity = existingBook.availableQuantity + (quantity - existingBook.totalQuantity);
        };
        books.add(id, updatedBook);
      };
    };
  };

  public shared ({ caller }) func removeBook(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove books");
    };
    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (book.availableQuantity < book.totalQuantity) {
          Runtime.trap("Cannot remove book with outstanding borrowings");
        };
        books.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    // Public access - anyone can view books
    books.values().toArray().sort();
  };

  public query ({ caller }) func searchBooksByTitle(title : Text) : async [Book] {
    // Public access - anyone can search books
    books.values().toArray().filter(
      func(book) {
        book.title.contains(#text title);
      }
    );
  };

  public query ({ caller }) func searchBooksByAuthor(author : Text) : async [Book] {
    // Public access - anyone can search books
    books.values().toArray().filter(
      func(book) {
        book.author.contains(#text author);
      }
    );
  };

  public query ({ caller }) func searchBooksByGenre(genre : Text) : async [Book] {
    // Public access - anyone can search books
    books.values().toArray().filter(
      func(book) {
        book.genre.contains(#text genre);
      }
    );
  };

  public query ({ caller }) func searchBooksByISBN(isbn : Text) : async [Book] {
    // Public access - anyone can search books
    books.values().toArray().filter(
      func(book) {
        book.isbn.contains(#text isbn);
      }
    );
  };

  // Member Management
  public shared ({ caller }) func addMember(name : Text, email : Text, memberType : { #student; #faculty; #external }) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add members");
    };
    let member : Member = {
      id = nextMemberId;
      name;
      email;
      memberType;
      joinDate = Time.now();
    };

    members.add(nextMemberId, member);
    nextMemberId += 1;
    member.id;
  };

  public shared ({ caller }) func updateMember(id : Nat, name : Text, email : Text, memberType : { #student; #faculty; #external }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update members");
    };
    switch (members.get(id)) {
      case (null) { Runtime.trap("Member not found") };
      case (?existingMember) {
        let updatedMember : Member = {
          id;
          name;
          email;
          memberType;
          joinDate = existingMember.joinDate;
        };
        members.add(id, updatedMember);
      };
    };
  };

  public shared ({ caller }) func removeMember(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove members");
    };
    if (not members.containsKey(id)) { Runtime.trap("Member not found") };
    members.remove(id);
  };

  public query ({ caller }) func getAllMembers() : async [Member] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all members");
    };
    members.values().toArray().sort();
  };

  // Borrowing System
  public shared ({ caller }) func borrowBook(memberId : Nat, bookId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can borrow books");
    };

    // Verify the caller is borrowing for themselves or is an admin
    switch (principalToMemberId.get(caller)) {
      case (?callerMemberId) {
        if (callerMemberId != memberId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only borrow books for yourself");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Member ID not associated with your account");
        };
      };
    };

    switch (books.get(bookId), members.get(memberId)) {
      case (null, _) { Runtime.trap("Book not found") };
      case (_, null) { Runtime.trap("Member not found") };
      case (?book, ?_member) {
        if (book.availableQuantity == 0) { Runtime.trap("No copies available") };

        let borrowRecord : BorrowRecord = {
          id = nextBorrowId;
          memberId;
          bookId;
          borrowDate = Time.now();
          dueDate = Time.now() + (14 * 24 * 60 * 60 * 1_000_000_000);
          returnDate = null;
          fineAmount = 0;
        };

        books.add(bookId, { book with availableQuantity = book.availableQuantity - 1 });
        borrowRecords.add(nextBorrowId, borrowRecord);
        nextBorrowId += 1;

        borrowRecord.id;
      };
    };
  };

  public shared ({ caller }) func returnBook(borrowId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can return books");
    };

    switch (borrowRecords.get(borrowId)) {
      case (null) { Runtime.trap("Borrow record not found") };
      case (?record) {
        // Verify the caller is returning their own book or is an admin
        switch (principalToMemberId.get(caller)) {
          case (?callerMemberId) {
            if (callerMemberId != record.memberId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only return your own books");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Member ID not associated with your account");
            };
          };
        };

        if (record.returnDate != null) { Runtime.trap("Book already returned") };
        switch (books.get(record.bookId)) {
          case (null) { Runtime.trap("Book not found") };
          case (?book) {
            books.add(record.bookId, { book with availableQuantity = book.availableQuantity + 1 });

            let now = Time.now();
            let overdueDays = if (now > record.dueDate) {
              ((now - record.dueDate) / (24 * 60 * 60 * 1_000_000_000)).toNat();
            } else { 0 };
            let fine = overdueDays * 5;

            borrowRecords.add(
              borrowId,
              {
                record with
                returnDate = ?now;
                fineAmount = fine;
              },
            );
            fine;
          };
        };
      };
    };
  };

  public query ({ caller }) func getActiveBorrowRecords() : async [BorrowRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all active borrow records");
    };
    borrowRecords.values().toArray().filter(
      func(record) { record.returnDate == null }
    );
  };

  public query ({ caller }) func getOverdueBorrowRecords() : async [BorrowRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all overdue borrow records");
    };
    borrowRecords.values().toArray().filter(
      func(record) {
        record.returnDate == null and Time.now() > record.dueDate
      }
    );
  };

  public query ({ caller }) func getMemberBorrowHistory(memberId : Nat) : async [BorrowRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view borrow history");
    };

    // Verify the caller is viewing their own history or is an admin
    switch (principalToMemberId.get(caller)) {
      case (?callerMemberId) {
        if (callerMemberId != memberId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own borrow history");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Member ID not associated with your account");
        };
      };
    };

    borrowRecords.values().toArray().filter(
      func(record) { record.memberId == memberId }
    );
  };

  public query ({ caller }) func getBookBorrowHistory(bookId : Nat) : async [BorrowRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view book borrow history");
    };
    borrowRecords.values().toArray().filter(
      func(record) { record.bookId == bookId }
    );
  };

  // Recommendation Engine
  public query ({ caller }) func getRecommendations(memberId : Nat) : async [Recommendation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get recommendations");
    };

    // Verify the caller is getting recommendations for themselves or is an admin
    switch (principalToMemberId.get(caller)) {
      case (?callerMemberId) {
        if (callerMemberId != memberId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only get recommendations for yourself");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Member ID not associated with your account");
        };
      };
    };

    let memberBorrowRecords = borrowRecords.values().toArray().filter(
      func(record) { record.memberId == memberId }
    );

    var genreScores = Map.empty<Text, Nat>();

    for (record in memberBorrowRecords.values()) {
      switch (books.get(record.bookId)) {
        case (?book) {
          switch (genreScores.get(book.genre)) {
            case (null) {
              genreScores.add(book.genre, 1);
            };
            case (?currentScore) {
              genreScores.add(book.genre, currentScore + 1);
            };
          };
        };
        case (null) {};
      };
    };

    let borrowedBookIds = Set.empty<Nat>();
    for (record in memberBorrowRecords.values()) {
      borrowedBookIds.add(record.bookId);
    };

    let availableBooks = books.values().toArray().filter(
      func(book) { book.availableQuantity > 0 and not borrowedBookIds.contains(book.id) }
    );

    let recommendations = availableBooks.map(
      func(book) {
        let genreScore = switch (genreScores.get(book.genre)) {
          case (null) { 0 };
          case (?score) { score };
        };
        {
          bookId = book.id;
          title = book.title;
          author = book.author;
          genre = book.genre;
          genreScore;
        };
      }
    );

    let sortedRecommendations = recommendations.sort(
      func(a, b) {
        Nat.compare(b.genreScore, a.genreScore);
      }
    );

    sortedRecommendations.sliceToArray(0, Nat.min(5, sortedRecommendations.size()));
  };

  // Dashboard Statistics
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard statistics");
    };

    let totalBooks = books.size();
    let totalMembers = members.size();
    let activeLoans = borrowRecords.values().toArray().filter(
      func(record) { record.returnDate == null }
    ).size();
    let overdueLoans = borrowRecords.values().toArray().filter(
      func(record) {
        record.returnDate == null and Time.now() > record.dueDate
      }
    ).size();

    var totalFines = 0;
    for (record in borrowRecords.values()) {
      if (record.returnDate != null) {
        totalFines += record.fineAmount;
      };
    };

    let mostBorrowedBooks = books.values().toArray().sort(Book.compareByAvailableQuantity).sliceToArray(0, Nat.min(5, books.size()));

    let recentlyAddedBooks = books.values().toArray().sort().sliceToArray(0, Nat.min(5, books.size()));

    {
      totalBooks;
      totalMembers;
      activeLoans;
      overdueLoans;
      totalFines;
      mostBorrowedBooks;
      recentlyAddedBooks;
    };
  };

  // Fine Calculation
  public query ({ caller }) func calculateFine(borrowId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate fines");
    };

    switch (borrowRecords.get(borrowId)) {
      case (null) { Runtime.trap("Borrow record not found") };
      case (?record) {
        // Verify the caller is calculating fine for their own borrow or is an admin
        switch (principalToMemberId.get(caller)) {
          case (?callerMemberId) {
            if (callerMemberId != record.memberId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only calculate fines for your own borrows");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Member ID not associated with your account");
            };
          };
        };

        if (record.returnDate != null) { return record.fineAmount };
        let now = Time.now();
        let overdueDays = if (now > record.dueDate) {
          ((now - record.dueDate) / (24 * 60 * 60 * 1_000_000_000)).toNat();
        } else { 0 };
        overdueDays * 5;
      };
    };
  };

  // Helper function to link a Principal to a Member ID
  public shared ({ caller }) func linkPrincipalToMember(memberId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link their account");
    };

    if (not members.containsKey(memberId)) {
      Runtime.trap("Member not found");
    };

    principalToMemberId.add(caller, memberId);
  };
};
