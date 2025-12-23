import re
with open('D:/Study/Codes/AAAnynotes/backend/python/src/services/chat/chat_service.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the problematic section
old_pattern = r'                converted_messages.append\({\r\n                    "sender": msg.sender,'
new_content = '''                # Defensive validation: ensure sender field exists
                sender = getattr(msg, 'sender', None)
                if not sender:
                    # Default to 'user' if sender is missing (most common case)
                    sender = 'user'
                    logger.warning(f"ChatService: Message missing sender field, defaulting to 'user': {msg}")
                elif sender not in ['user', 'ai']:
                    # Invalid sender value, default to 'user'
                    logger.warning(f"ChatService: Invalid sender value '{sender}', defaulting to 'user'")
                    sender = 'user'
                
                converted_messages.append({
                    "sender": sender,'''

content = re.sub(old_pattern, new_content, content)

with open('D:/Study/Codes/AAAnynotes/backend/python/src/services/chat/chat_service.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully')
