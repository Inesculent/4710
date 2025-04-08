import java.util.*;
import java.sql.*;

public class Main {

    static final String url = "jdbc:mysql://localhost:3306/database1";
    static final String user = "root";
    static final String pw = "SuperSecure!";

    public static void main(String[] args) {




        createUser("user2", "cat", "haha@ucf.edu", 123, "admin");

        System.out.println(approveEvent(8, 2025));

        List<Event> arr = getEvents(123);

        for (Event e: arr){
            System.out.println(e.toString());
        }



    }

    public static boolean approveEvent(int eventId, int userId){

        //If the user isn't a superadmin
        if (!isSuperAdmin(userId)){
            return false;
        }

        String sql = "UPDATE public_events SET approved = TRUE WHERE event_id = ?";

        try (Connection conn = DriverManager.getConnection(url, user, pw);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, eventId);
            int affectedRows = stmt.executeUpdate();

            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

    }

    //Code -1 = no permission
    //Code 0 = failed
    //Code 1 = success
    public static int createEvent(Event event, int ownerId, String eventType) {


        //If there aren't permissions to create an event
        if (!isAdmin(ownerId) && !isSuperAdmin(ownerId)){

            return -1;
        }

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DriverManager.getConnection(url, user, pw);
            conn.setAutoCommit(false); // start transaction

            // Insert into events table and retrieve generated keys.
            String sqlInsertEvent = "INSERT INTO events (title, description, start_date, end_date, address_id) VALUES (?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(sqlInsertEvent, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, event.getTitle());
            ps.setString(2, event.getDescription());
            ps.setTimestamp(3, event.getStartDate());
            ps.setTimestamp(4, event.getEndDate());
            ps.setInt(5, event.getAddressId());
            int affectedRows = ps.executeUpdate();

            if (affectedRows == 0) {
                conn.rollback();
                return 0;
            }

            // Retrieve the auto-generated event_id.
            int eventId;
            try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    eventId = generatedKeys.getInt(1);
                    event.setEventId(eventId); // update the event object if needed
                } else {
                    conn.rollback();
                    return 0;
                }
            }

            // For private events, we don't need super admin approval
            if (eventType.equalsIgnoreCase("private")) {
                String tableName = "private_events";
                String sqlInsertType = "INSERT INTO private_events (event_id, owner_id) VALUES (?, ?)";
                try (PreparedStatement psType = conn.prepareStatement(sqlInsertType)) {
                    psType.setInt(1, eventId); // use the generated event_id
                    psType.setInt(2, ownerId);
                    psType.executeUpdate();
                }
            }

            if (eventType.equalsIgnoreCase("public")){
                boolean approved = isSuperAdmin(ownerId);
                String sqlInsertType = "INSERT INTO public_events (event_id, owner_id, approved) VALUES (?, ?, ?)";

                try (PreparedStatement psType = conn.prepareStatement(sqlInsertType)) {
                    psType.setInt(1, eventId); // use the generated event_id
                    psType.setInt(2, ownerId);
                    psType.setBoolean(3, approved);
                    psType.executeUpdate();
                }
            }
            conn.commit();
            return 1;
        } catch (SQLException e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            return 0;
        } finally {
            try {
                if (ps != null) {
                    ps.close();
                }
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static boolean deleteEvent(int eventId){

        String sql = "DELETE FROM events WHERE event_id = ?";

        try(Connection conn = DriverManager.getConnection(url, user, pw);
            PreparedStatement state = conn.prepareStatement(sql)){

            state.setInt(1, eventId);

            int rowsDeleted = state.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e){
            e.printStackTrace();
            return false;
        }
    }



    //Function to get all the events tied to a user
    public static List<Event> getEvents(int userId) {
        String sql;
        List<Event> events = new ArrayList<>();

        if (isSuperAdmin(userId)) {
            // For superadmins, return all events (without a specific event type)
            sql = "SELECT *, '' AS eventType FROM events";
        } else {
            sql = "SELECT e.*, 'public' AS eventType " +
                    "FROM events e " +
                    "JOIN public_events pe ON e.event_id = pe.event_id " +
                    "WHERE (pe.approved = TRUE OR pe.owner_id = ?) " +
                    "UNION " +
                    "SELECT e.*, 'private' AS eventType " +
                    "FROM events e " +
                    "JOIN private_events pve ON e.event_id = pve.event_id " +
                    "WHERE pve.owner_id = ? " +
                    "UNION " +
                    "SELECT e.*, 'rso_events' AS eventType " +
                    "FROM events e " +
                    "JOIN rso_events re ON e.event_id = re.event_id " +
                    "JOIN user_rso ur ON re.rso_id = ur.rso_id " +
                    "WHERE ur.user_id = ?;";
        }

        try (Connection conn = DriverManager.getConnection(url, user, pw);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            if (!isSuperAdmin(userId)) {
                // Set parameters for the UNION query: one for public/private and one for RSO events
                stmt.setInt(1, userId); // For public_events: owner condition
                stmt.setInt(2, userId); // For private_events: owner condition
                stmt.setInt(3, userId); // For rso_events: user membership condition
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Event event = new Event();
                    event.setEventId(rs.getInt("event_id"));
                    event.setTitle(rs.getString("title"));
                    event.setDescription(rs.getString("description"));
                    event.setStartDate(rs.getTimestamp("start_date"));
                    event.setEndDate(rs.getTimestamp("end_date"));
                    event.setAddressId(rs.getInt("address_id"));
                    event.setEventType(rs.getString("eventType")); // Set the event type field
                    events.add(event);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return events;
    }


    //Class event to return
    public static class Event {
        private int eventId;
        private String title;

        private String eventType;
        private String description;
        private Timestamp startDate;
        private Timestamp endDate;
        private int addressId;

        // Constructors, getters, and setters
        public Event() {}

        public Event(int eventId, String title, String description, Timestamp startDate, Timestamp endDate, int addressId) {
            this.eventId = eventId;
            this.title = title;
            this.description = description;
            this.startDate = startDate;
            this.endDate = endDate;
            this.addressId = addressId;
        }

        public int getEventId() {
            return eventId;
        }

        public void setEventId(int eventId) {
            this.eventId = eventId;
        }

        public void setEventType(String eventType){
            this.eventType = eventType;
        }

        public String getEventType(){
            return eventType;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Timestamp getStartDate() {
            return startDate;
        }

        public void setStartDate(Timestamp startDate) {
            this.startDate = startDate;
        }

        public Timestamp getEndDate() {
            return endDate;
        }

        public void setEndDate(Timestamp endDate) {
            this.endDate = endDate;
        }

        public int getAddressId() {
            return addressId;
        }

        public void setAddressId(int addressId) {
            this.addressId = addressId;
        }

        @Override
        public String toString() {
            return "Event{" +
                    "eventId=" + eventId +
                    ", title='" + title + '\'' +
                    ", description='" + description + '\'' +
                    ", startDate=" + startDate +
                    ", endDate=" + endDate +
                    ", addressId=" + addressId +
                    '}';
        }
    }


    //Check to see if the user already exists in our db
    public static boolean existsUser(int uid){

        String query = "SELECT COUNT(*) FROM users WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, pw);
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, uid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    return count > 0;
                }
            }
        }
        catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        return false;
    }



    //Check admin before executing something that needs admin perms
    public static boolean isAdmin(int uid){

        String query = "SELECT COUNT(*) FROM admin WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, pw);
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, uid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    return count > 0;
                }
            }
        }
        catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        return false;
    }


    //Check superadmin before executing something that needs superadmin perms
    public static boolean isSuperAdmin(int uid){

        //If the uid shows up in the superadmin table, then it is a superadmin
        String query = "SELECT COUNT(*) FROM super_admin WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, pw);
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, uid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    return count > 0;
                }
            }
        }
        catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        return false;
    }

    //Can do the same for superadmin, since we only have two types, no need to make anything fancier




    //To create a new user
    public static boolean createUser(String userType, String name, String email, int uid, String password) {

        if (existsUser(uid)){
            return false;
        }
        try (Connection conn = DriverManager.getConnection(url, user, pw)) {

            conn.setAutoCommit(false);

            //Insert into users table
            String insertUserSql = "INSERT INTO users (uid, name, email, password) VALUES (?, ?, ?, ?)";
            try (PreparedStatement userStmt = conn.prepareStatement(insertUserSql)) {
                userStmt.setInt(1, uid);
                userStmt.setString(2, name);
                userStmt.setString(3, email);
                userStmt.setString(4, password);
                userStmt.executeUpdate();
            }

            //If user is admin
            if (userType.equalsIgnoreCase("admin")) {
                String insertAdminSql = "INSERT INTO admin (uid) VALUES (?)";
                try (PreparedStatement adminStmt = conn.prepareStatement(insertAdminSql)) {
                    adminStmt.setInt(1, uid);
                    adminStmt.executeUpdate();
                }
            }

            //If user is super_admin
            if (userType.equalsIgnoreCase("super_admin")) {
                String insertAdminSql = "INSERT INTO super_admin (uid) VALUES (?)";
                try (PreparedStatement adminStmt = conn.prepareStatement(insertAdminSql)) {
                    adminStmt.setInt(1, uid);
                    adminStmt.executeUpdate();
                }
            }

            //Commit if both the inserts worked
            conn.commit();
            System.out.println("User created successfully.");
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
