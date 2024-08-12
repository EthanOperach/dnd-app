from flask import Flask, render_template, request, redirect, url_for, send_from_directory, abort, jsonify
from flask_cors import CORS
import os
import PyPDF2

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_uploaded_files():
    return [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.endswith('.pdf')]

@app.route('/', methods=['GET', 'POST'])
def manage_files():
    message = None
    if request.method == 'POST':
        if 'file' not in request.files:
            message = 'No file part'
        else:
            file = request.files['file']
            if file.filename == '':
                message = 'No selected file'
            elif file and allowed_file(file.filename):
                filename = file.filename
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                message = f'File {filename} uploaded successfully'
            else:
                message = 'Invalid file type'
        return jsonify({"message": message})
    else:
        files = get_uploaded_files()
        return jsonify({"files": [{"name": f} for f in files]})

@app.route('/<filename>', methods=['GET'])
def view_file(filename):
    if filename not in get_uploaded_files():
        abort(404)
    return render_template('view.html', filename=filename)

@app.route('/<filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return '', 204
    else:
        abort(404)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/extract/<filename>', methods=['GET'])
def extract_pdf_data(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        abort(404)
    
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        if '/AcroForm' in pdf_reader.trailer['/Root']:
            fields = pdf_reader.get_fields()
            
            form_data = {}
            for field_name, field in fields.items():
                if field.get('/FT') == '/Tx':  # only interested in text fields
                    form_data[field_name] = field.get('/V', '')
            
            return jsonify(form_data)
        else:
            return jsonify({'error': 'No form found in the PDF'})

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)