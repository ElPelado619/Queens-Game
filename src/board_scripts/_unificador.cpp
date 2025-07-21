#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <set>
#include <map>
#include <dirent.h>
#include <algorithm>

using namespace std;

string read_entire_file(const string& filepath) {
    ifstream in(filepath.c_str());
    stringstream buffer;
    buffer << in.rdbuf();
    return buffer.str();
}

// Extrae solo el contenido [...] después de board_X:
vector<string> extract_boards_content(const string& content) {
    vector<string> boards;
    size_t pos = 0;
    while ((pos = content.find("board_", pos)) != string::npos) {
        size_t start = content.find("board_", pos);
        size_t colon = content.find(":", start);
        if (colon == string::npos) break;

        size_t open = content.find("[", colon);
        if (open == string::npos) break;

        int brackets = 1;
        size_t end = open + 1;
        while (end < content.size() && brackets > 0) {
            if (content[end] == '[') brackets++;
            else if (content[end] == ']') brackets--;
            ++end;
        }

        if (brackets == 0) {
            // Extraigo solo desde el '[' hasta el ']' cerrado
            string array_content = content.substr(open, end - open);
            boards.push_back(array_content);
        }
        pos = end;
    }
    return boards;
}

// Normaliza para detectar duplicados (sin espacios ni comas)
string normalize_board(const string& board_content) {
    string out;
    for (char c : board_content) {
        if (!isspace(c) && c != ',') out += c;
    }
    return out;
}

int main() {
    string input_dir = "./unificar_input";
    string output_file = "./chaosBoards8.js";

    DIR* dir = opendir(input_dir.c_str());
    if (!dir) {
        cerr << "No se pudo abrir el directorio '" << input_dir << "'." << endl;
        return 1;
    }

    map<string, string> unique_boards; // normalizado -> contenido matriz
    dirent* entry;
    while ((entry = readdir(dir)) != nullptr) {
        string fname = entry->d_name;
        if (fname.length() > 3 && fname.substr(fname.length() - 3) == ".js") {
            string full_path = input_dir + "/" + fname;
            string content = read_entire_file(full_path);
            vector<string> boards = extract_boards_content(content);
            for (const string& b : boards) {
                string norm = normalize_board(b);
                if (unique_boards.count(norm) == 0) {
                    unique_boards[norm] = b;
                }
            }
        }
    }
    closedir(dir);

    // Escribir archivo de salida
    ofstream out(output_file.c_str());
    if (!out) {
        cerr << "No se pudo crear el archivo de salida." << endl;
        return 1;
    }

    out << "export const boards8 = {\n";
    int id = 1;
    for (const auto& pair : unique_boards) {
        out << "  board_" << id++ << ": " << pair.second << ",\n";
    }
    out << "};\n";

    cout << "Archivo generado con " << unique_boards.size() << " tableros únicos." << endl;
    return 0;
}
