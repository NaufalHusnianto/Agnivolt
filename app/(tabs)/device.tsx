import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, get } from "firebase/database";

const showAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Info", message);
  }
};

export default function Device() {
  const [devices, setDevices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputTurbineId, setInputTurbineId] = useState("");

  const saveDevicesToStorage = async (devicesList: any[]) => {
    try {
      await AsyncStorage.setItem("devices", JSON.stringify(devicesList));
    } catch (error) {
      console.error("Gagal menyimpan ke AsyncStorage:", error);
    }
  };

  const loadDevicesFromStorage = async () => {
    try {
      const storedDevices = await AsyncStorage.getItem("devices");
      if (storedDevices) {
        setDevices(JSON.parse(storedDevices));
      }
    } catch (error) {
      console.error("Gagal mengambil dari AsyncStorage:", error);
    }
  };

  useEffect(() => {
    loadDevicesFromStorage();
  }, []);

  const checkTurbineExists = async (id_turbine: string) => {
    const db = getDatabase();
    const turbineRef = ref(db, `TurbineData/${id_turbine}`);

    try {
      const snapshot = await get(turbineRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error saat mengecek database:", error);
      return false;
    }
  };

  const handleAddDevice = async () => {
    if (!inputTurbineId.trim()) {
      showAlert("Masukkan ID Turbine terlebih dahulu!");
      return;
    }

    const exists = await checkTurbineExists(inputTurbineId);

    if (exists) {
      const isAlreadyAdded = devices.some(
        (device) => device.id === inputTurbineId
      );
      if (isAlreadyAdded) {
        showAlert("Device sudah ditambahkan sebelumnya.");
        return;
      }

      const newDevice = {
        id: inputTurbineId,
        name: `Turbine ${inputTurbineId}`,
        status: "Connected",
      };

      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      saveDevicesToStorage(updatedDevices);

      setModalVisible(false);
      setInputTurbineId("");
    } else {
      showAlert(`Turbine dengan ID "${inputTurbineId}" tidak ditemukan!`);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    const updatedDevices = devices.filter((device) => device.id !== id);
    setDevices(updatedDevices);
    await saveDevicesToStorage(updatedDevices);
    showAlert(`Device dengan ID ${id} telah dihapus.`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Device</Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceItem}>
            <View>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceStatus}>{item.status}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteDevice(item.id)}
            >
              <Text style={styles.deleteButtonText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Masukkan ID Turbine</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan ID Turbine..."
              value={inputTurbineId}
              onChangeText={setInputTurbineId}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddDevice}
              >
                <Text style={styles.buttonText}>Cari & Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  deviceStatus: {
    fontSize: 14,
    color: "#888",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#5cb85c",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
