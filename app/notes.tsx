import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Note, StorageService } from '../service/storageService';

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { subjectId, subjectName, subjectIcon, subjectColor } = params;

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, [subjectId]);

  const loadNotes = async () => {
    if (subjectId) {
      const data = await StorageService.getNotes(subjectId as string);
      setNotes(data);
    }
  };

  const handleAddNote = async () => {
    if (noteContent.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung ghi chú');
      return;
    }

    try {
      if (editingNoteId) {
        await StorageService.updateNote(
          subjectId as string,
          editingNoteId,
          noteContent
        );
        setEditingNoteId(null);
      } else {
        await StorageService.addNote(subjectId as string, noteContent);
      }
      setNoteContent('');
      await loadNotes();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu ghi chú');
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteContent(note.content);
    setEditingNoteId(note.id);
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa ghi chú này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteNote(subjectId as string, noteId);
            await loadNotes();
          },
        },
      ]
    );
  };

  const cancelEdit = () => {
    setNoteContent('');
    setEditingNoteId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <Text style={styles.noteContent}>{item.content}</Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {formatDate(item.updatedAt)}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditNote(item)}
          >
            <Text style={styles.editButtonText}>✏️ Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNote(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={subjectColor as string} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: subjectColor as string }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>{subjectIcon}</Text>
          <Text style={styles.headerTitle}>{subjectName}</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {notes.length} ghi chú
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập ghi chú mới..."
            placeholderTextColor="#999"
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            maxLength={500}
          />
          <View style={styles.inputActions}>
            {editingNoteId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: subjectColor as string },
              ]}
              onPress={handleAddNote}
            >
              <Text style={styles.addButtonText}>
                {editingNoteId ? '✓ Cập nhật' : '+ Thêm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes List */}
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>Chưa có ghi chú nào</Text>
            <Text style={styles.emptyHint}>
              Thêm ghi chú đầu tiên của bạn ở trên
            </Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    color: '#333',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fee',
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#d32f2f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});