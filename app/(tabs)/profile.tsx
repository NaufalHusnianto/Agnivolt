import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

export default function Profile() {
  const router = useRouter();

  const handleLogout = () => {
    router.navigate("/");
    console.log("Logout berhasil!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name={"person-circle-sharp"} color={"#25292e"} size={120} />
        <Text style={styles.name}>Candra Zulkarnain</Text>
      </View>

      {/* Informasi Profil */}
      <ScrollView style={styles.menu}>
        <View style={styles.infoItem}>
          <Ionicons name="id-card" size={24} color="#007AFF" />
          <Text style={styles.infoText}>Nama Lengkap: Candra Zulkarnain</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={styles.infoText}>
            Alamat: Jl. Merdeka No. 123, Jakarta
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="mail" size={24} color="#007AFF" />
          <Text style={styles.infoText}>Email: candra@example.com</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call" size={24} color="#007AFF" />
          <Text style={styles.infoText}>No. HP: +62 812-3456-7890</Text>
        </View>
      </ScrollView>

      {/* Tombol Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#25292e",
    marginTop: 10,
  },
  menu: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#25292e",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    borderRadius: 10,
    margin: 30,
  },
  logoutText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
