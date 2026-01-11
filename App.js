import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setTasks(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (inputText.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputText.trim(), completed: false }]);
      setInputText('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    if (completedCount === 0) return;
    Alert.alert(
      "Limpiar tareas",
      "¿Eliminar todas las tareas completadas?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => setTasks(tasks.filter(t => !t.completed)) }
      ]
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Mis Tareas</Text>
        <Text style={styles.counter}>{completedCount}/{tasks.length} completadas</Text>
        
        {completedCount > 0 && (
          <Pressable onPress={clearCompleted} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Limpiar completadas</Text>
          </Pressable>
        )}

        <View style={styles.filterRow}>
          {['all', 'pending', 'completed'].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="¿Qué tienes que hacer?"
          placeholderTextColor="#999"
          onSubmitEditing={addTask}
        />
        <Pressable 
          style={({pressed}) => [styles.addButton, pressed && styles.addButtonPressed]} 
          onPress={addTask}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>¡Todo al día!</Text>
            <Text style={styles.emptySubtext}>Agrega una tarea para comenzar</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.taskRow, item.completed && styles.taskRowCompleted]}>
            <Pressable onPress={() => toggleTask(item.id)} style={styles.checkbox}>
              <Text style={styles.checkboxIcon}>{item.completed ? '✅' : '⬜'}</Text>
            </Pressable>
            <Text style={[styles.taskText, item.completed && styles.completed]}>
              {item.text}
            </Text>
            <Pressable onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>🗑️</Text>
            </Pressable>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7', // Color de fondo más suave
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  counter: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  clearBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearBtnText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    // Sombras suaves
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#4F46E5', // Indigo moderno
    width: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    marginTop: -2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskRowCompleted: {
    opacity: 0.8,
    backgroundColor: '#F9FAFB',
  },
  checkbox: {
    marginRight: 16,
  },
  checkboxIcon: {
    fontSize: 20,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
});