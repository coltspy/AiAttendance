from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import face_recognition

app = Flask(__name__)

@app.route('/recognize-faces', methods=['POST'])
def recognize_faces():
    # Get the image and student data from the request
    data = request.json
    attendance_image = base64_to_image(data['attendanceImage'])
    students = data['students']

    # Find face locations and encodings in the attendance image
    attendance_face_locations = face_recognition.face_locations(attendance_image)
    attendance_face_encodings = face_recognition.face_encodings(attendance_image, attendance_face_locations)

    # Recognize faces and mark attendance
    attendance_results = {}
    for student in students:
        student_image = base64_to_image(student['photoUrl'])
        student_encoding = face_recognition.face_encodings(student_image)[0]
        
        matches = face_recognition.compare_faces(attendance_face_encodings, student_encoding)
        if True in matches:
            attendance_results[student['name']] = 'present'
        else:
            attendance_results[student['name']] = 'absent'

    return jsonify(attendance_results)

def base64_to_image(base64_string):
    image_data = base64.b64decode(base64_string.split(',')[1])
    nparr = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

if __name__ == '__main__':
    app.run(debug=True)