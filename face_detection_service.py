from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import face_recognition
import firebase_admin
from firebase_admin import credentials, firestore
import requests

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/serviceAccountKey.json')  # Replace with your Firebase Admin SDK JSON file path
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/recognize-faces', methods=['POST'])
def recognize_faces():
    # Get the image and class ID from the request
    data = request.json
    attendance_image = base64_to_image(data['attendanceImage'])
    class_id = data['classId']

    # Fetch students from the Firestore database
    students = get_students_from_class(class_id)

    # Find face locations and encodings in the attendance image
    attendance_face_locations = face_recognition.face_locations(attendance_image)
    attendance_face_encodings = face_recognition.face_encodings(attendance_image, attendance_face_locations)

    attendance_results = {}
    for (top, right, bottom, left), face_encoding in zip(attendance_face_locations, attendance_face_encodings):
        matches = face_recognition.compare_faces([student['encoding'] for student in students], face_encoding)
        name = "Unknown"

        face_distances = face_recognition.face_distance([student['encoding'] for student in students], face_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = students[best_match_index]['name']
            attendance_results[name] = 'present'
        else:
            attendance_results[name] = 'absent'

        # Draw a box around the face
        cv2.rectangle(attendance_image, (left, top), (right, bottom), (0, 255, 0), 2)
        # Draw a label with a name below the face
        cv2.rectangle(attendance_image, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(attendance_image, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

    # Encode the image back to base64
    retval, buffer = cv2.imencode('.jpg', attendance_image)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    image_base64 = 'data:image/jpeg;base64,' + jpg_as_text

    return jsonify({'attendanceResults': attendance_results, 'annotatedImage': image_base64})

def get_students_from_class(class_id):
    students_ref = db.collection('classes').document(class_id)
    class_doc = students_ref.get()
    students_data = []
    if class_doc.exists:
        class_data = class_doc.to_dict()
        students = class_data.get('students', [])
        for student in students:
            name = student['name']
            photo_url = student['photoUrl']
            try:
                student_image = fetch_image_from_url(photo_url)
                student_encoding = face_recognition.face_encodings(student_image)[0]
                students_data.append({'name': name, 'encoding': student_encoding})
            except Exception as e:
                print(f"Error processing student {name}: {e}")
    else:
        print("Class document does not exist.")
    return students_data

def fetch_image_from_url(url):
    response = requests.get(url)
    image = np.array(bytearray(response.content), dtype=np.uint8)
    return cv2.imdecode(image, cv2.IMREAD_COLOR)

def base64_to_image(base64_string):
    image_data = base64.b64decode(base64_string.split(',')[1])
    nparr = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

if __name__ == '__main__':
    app.run(debug=True)
