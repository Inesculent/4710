import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;

public class Main {

    static String url = "jdbc:mysql://localhost:3306/database1";
    static String user = "root";
    static String password = "SuperSecure!";

    public static void main(String[] args) {


        System.out.println(createUser("admin", "Dylan D", "inesculent@gmail.com", 1234));

        System.out.println(isAdmin(1234));

    }


    public List<String>


    //Check to see if the user already exists in our db
    public static boolean existsUser(int uid){

        String query = "SELECT COUNT(*) FROM users WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, password);
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
            // In a production scenario, you might want to log this exception and handle it appropriately.
            return false;
        }

        return false;
    }



    //Check admin before executing something that needs admin perms
    public static boolean isAdmin(int uid){

        String query = "SELECT COUNT(*) FROM admin WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, password);
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
            // In a production scenario, you might want to log this exception and handle it appropriately.
            return false;
        }

        return false;
    }


    //Check superadmin before executing something that needs superadmin perms
    public static boolean isSuperAdmin(int uid){

        String query = "SELECT COUNT(*) FROM super_admin WHERE uid = ?";

        try (Connection conn = DriverManager.getConnection(url, user, password);
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
            // In a production scenario, you might want to log this exception and handle it appropriately.
            return false;
        }

        return false;
    }

    //Can do the same for superadmin, since we only have two types, no need to make anything fancier

    public static boolean createUser(String userType, String name, String email, int uid) {

        if (existsUser(uid)){
            return false;
        }
        try (Connection conn = DriverManager.getConnection(url, user, password)) {

            conn.setAutoCommit(false);

            //Insert into users table
            String insertUserSql = "INSERT INTO users (uid, name, email) VALUES (?, ?, ?)";
            try (PreparedStatement userStmt = conn.prepareStatement(insertUserSql)) {
                userStmt.setInt(1, uid);
                userStmt.setString(2, name);
                userStmt.setString(3, email);
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
                String insertAdminSql = "INSERT INTO admin (uid) VALUES (?)";
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
