#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <fstream>
#include <unordered_set>
#include <numeric>
#include <atomic>
#include <mutex>
#include <cmath>     // Para std::abs
#include <functional> // Para std::function
#include <set>      // Para std::set (incluido por si acaso, aunque vector<pair<int,int>> es lo que se usa en el backtrack de ChatGPT)

using namespace std;

// --- Estructuras y Variables Globales ---
struct Position {
    int row, col;
    bool operator==(const Position& other) const {
        return row == other.row && col == other.col;
    }
};

int N; // Tamaño del tablero
atomic<int> board_id(0); // Contador de tableros generados
mutex mtx; // Mutex para proteger el acceso a board_hashes y board_id si se usaran hilos
unordered_set<string> board_hashes; // Para evitar tableros duplicados

// --- Funciones Auxiliares Propias (para initial_queen_placements y region_solver) ---

// Verifica las reglas de colocación entre dos reinas:
// - No en la misma fila.
// - No en la misma columna.
// - No adyacentes (incluyendo diagonales).
bool are_queens_attacking_or_adjacent(const Position& q1, const Position& q2) {
    // Misma fila o columna
    if (q1.row == q2.row || q1.col == q2.col) {
        return true;
    }
    // Adyacentes (incluyendo diagonales)
    // Esto significa que la diferencia absoluta en filas y columnas es como máximo 1.
    if (abs(q1.row - q2.row) <= 1 && abs(q1.col - q2.col) <= 1) {
        return true;
    }
    return false;
}

// Genera todas las configuraciones iniciales válidas de reinas.
vector<vector<Position>> generate_queen_placements() {
    vector<vector<Position>> valid_placements;
    vector<int> current_queens_cols(N); // current_queens_cols[row] = col_of_queen_in_row
    
    std::function<void(int)> solve_n_queens_recursive = 
        [&](int row) {
        if (row == N) {
            // Todas las reinas han sido colocadas, verificar que la configuración sea válida.
            vector<Position> current_solution_positions(N);
            for(int i = 0; i < N; ++i) {
                current_solution_positions[i] = {i, current_queens_cols[i]};
            }

            bool is_valid_initial_placement = true;
            for (int i = 0; i < N; ++i) {
                for (int j = i + 1; j < N; ++j) {
                    if (are_queens_attacking_or_adjacent(current_solution_positions[i], current_solution_positions[j])) {
                        is_valid_initial_placement = false;
                        break; // Se encontró una violación de las reglas
                    }
                }
                if (!is_valid_initial_placement) break;
            }

            if (is_valid_initial_placement) {
                valid_placements.push_back(current_solution_positions);
            }
            return;
        }

        // Intentar colocar una reina en cada columna para la fila actual
        for (int col = 0; col < N; ++col) {
            bool can_place_current = true; // Renamed to avoid confusion with ChatGPT's can_place
            // Verificar contra reinas ya colocadas en filas anteriores
            for (int prev_row = 0; prev_row < row; ++prev_row) {
                Position prev_queen_pos = {prev_row, current_queens_cols[prev_row]};
                Position current_candidate_pos = {row, col};
                
                if (are_queens_attacking_or_adjacent(prev_queen_pos, current_candidate_pos)) {
                    can_place_current = false;
                    break;
                }
            }

            if (can_place_current) {
                current_queens_cols[row] = col;
                solve_n_queens_recursive(row + 1); // Pasar a la siguiente fila
            }
        }
    };
    
    // Iniciar la recursión desde la primera fila
    solve_n_queens_recursive(0);

    return valid_placements;
}


// Genera regiones usando BFS multi-fuente
void generate_regions(const vector<Position>& queens, vector<vector<int>>& board) {
    board.assign(N, vector<int>(N, 0)); // Reinicia el tablero
    queue<pair<Position, int>> q; // Cola para BFS: {posición, ID de la región}

    // Inicializa las reinas con sus IDs de región (1 a N) y las agrega a la cola
    for (int i = 0; i < N; ++i) {
        board[queens[i].row][queens[i].col] = i + 1; // Las reinas están en regiones 1 a N
        q.push({queens[i], i + 1});
    }

    // Direcciones (arriba, abajo, izquierda, derecha)
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};

    while (!q.empty()) {
        Position current_pos = q.front().first;
        int region_id = q.front().second;
        q.pop();

        for (int i = 0; i < 4; ++i) {
            int new_r = current_pos.row + dr[i];
            int new_c = current_pos.col + dc[i];

            if (new_r >= 0 && new_r < N && new_c >= 0 && new_c < N && board[new_r][new_c] == 0) {
                board[new_r][new_c] = region_id;
                q.push({{new_r, new_c}, region_id});
            }
        }
    }
}

// Rotación del tablero 90 grados en sentido horario
vector<vector<int>> rotate_board(const vector<vector<int>>& board) {
    vector<vector<int>> rotated(N, vector<int>(N));
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            rotated[j][N - 1 - i] = board[i][j];
        }
    }
    return rotated;
}

// Volteo horizontal del tablero
vector<vector<int>> flip_board(const vector<vector<int>>& board) {
    vector<vector<int>> flipped = board;
    for (auto& row : flipped) {
        reverse(row.begin(), row.end());
    }
    return flipped;
}

// Serializa el tablero a una cadena para la detección de duplicados
string board_to_string(const vector<vector<int>>& board) {
    string s;
    for (const auto& row : board) {
        for (int val : row) {
            s += to_string(val) + ",";
        }
    }
    return s;
}

// --- FUNCIONES DE CHATGPT PARA VERIFICACIÓN DE UNICIDAD (ADAPTADAS) ---
// Comprueba si poner reina en (r,c) es válida:
// no debe atacar otras reinas ya puestas y no puede estar en casilla adyacente (incl. diagonales)
bool can_place_for_uniqueness(const vector<pair<int,int>>& placed, int r, int c) {
    for (auto& q : placed) {
        int rr = q.first;
        int cc = q.second;
        // Misma fila o columna
        if (rr == r || cc == c)
            return false;
        // Celdas adyacentes (incluyendo diagonales)
        if (abs(rr - r) <= 1 && abs(cc - c) <= 1)
            return false;
    }
    return true;
}

// Backtracking recursivo que intenta asignar reinas a cada región (region_id desde 1..N)
// placed: posiciones ya colocadas
// regions: tablero con número de región por celda
// count_solutions: contador de soluciones encontradas (se detiene si >1)
// max_solutions: máximo a buscar antes de cortar búsqueda (usualmente 2 para unicidad)
void backtrack_for_uniqueness(int region_id, const vector<vector<int>>& regions,
               vector<pair<int,int>>& placed,
               int& count_solutions,
               int max_solutions) {
    if (count_solutions > max_solutions)
        return; // poda temprana

    if (region_id > N) {
        // todas las regiones tienen reina colocada
        count_solutions++;
        return;
    }

    // Encontrar todas las celdas de la región actual
    for (int r = 0; r < N; ++r) {
        for (int c = 0; c < N; ++c) {
            if (regions[r][c] == region_id) {
                if (can_place_for_uniqueness(placed, r, c)) {
                    placed.push_back({r,c});
                    backtrack_for_uniqueness(region_id + 1, regions, placed, count_solutions, max_solutions);
                    placed.pop_back();
                    if (count_solutions > max_solutions) return; // poda temprana
                }
            }
        }
    }
}

// Función para verificar si el tablero dado tiene solución única (Implementación de ChatGPT)
// Retorna la cantidad de soluciones encontradas, no solo un booleano.
int count_unique_solutions(const vector<vector<int>>& regions) {
    vector<pair<int,int>> placed;
    int count_solutions = 0;
    // Buscamos hasta 2 soluciones para determinar unicidad (0, 1, o >1)
    backtrack_for_uniqueness(1, regions, placed, count_solutions, 2); 
    return count_solutions;
}

// --- Funciones de Guardado y Main ---

// Guarda los tableros en el archivo de salida
void save_boards(const vector<vector<vector<int>>>& boards, ofstream& out_file) {
    lock_guard<mutex> lock(mtx); // Protege el acceso si se usan hilos

    for (const auto& board_to_save : boards) {
        string board_str = board_to_string(board_to_save);

        cout << "  [DEBUG] Procesando un tablero..." << endl; // DEBUG

        // 1. Evitar duplicados (simetrías ya consideradas si vienen en 'boards')
        if (board_hashes.count(board_str)) {
            cout << "  [DEBUG] Tablero descartado: duplicado." << endl; // DEBUG
            continue;
        }

        // 2. Verificar la unicidad de la solución del tablero
        int solutions_found = count_unique_solutions(board_to_save); // Ahora obtenemos el conteo

        if (solutions_found == 0) {
            cout << "  [DEBUG] Tablero descartado: 0 soluciones." << endl; // DEBUG
            continue;
        } else if (solutions_found > 1) {
            cout << "  [DEBUG] Tablero descartado: " << solutions_found << " soluciones." << endl; // DEBUG
            continue;
        }

        // Si es único y tiene *exactamente 1* solución única, añadirlo
        board_hashes.insert(board_str);

        // Incrementar el ID del tablero
        int current_id = ++board_id;

        // Coma para separar las entradas JSON (excepto la primera)
        if (current_id > 1) { // Verifica si no es el primer tablero a escribir
            out_file << ",\n";
        }
        
        // Formato de salida JavaScript
        out_file << "  \"board_" << current_id << "\": [\n";
        for (int i = 0; i < N; ++i) {
            out_file << "    [";
            for (int j = 0; j < N; ++j) {
                out_file << board_to_save[i][j];
                if (j < N - 1) out_file << ",";
            }
            out_file << "]";
            if (i < N - 1) out_file << ",";
            out_file << "\n";
        }
        out_file << "  ]";
        cout << "  [DEBUG] Tablero " << current_id << " guardado exitosamente." << endl; // DEBUG

        // Límite de tableros
        if (board_id >= 5000) {
            cout << "  [DEBUG] Límite de 5000 tableros alcanzado. Deteniendo generación." << endl; // DEBUG
            break; // Salir del bucle si ya alcanzamos el límite
        }
    }
}


int main() {
    cout << "Ingrese tamaño del tablero (N >= 4): ";
    cin >> N;

    if (N < 4) {
        cerr << "El tamaño debe ser al menos 4" << endl;
        return 1;
    }

    cout << "Generando configuraciones iniciales válidas de reinas (con las nuevas reglas)..." << endl;
    auto initial_queen_placements = generate_queen_placements();
    cout << "Encontradas " << initial_queen_placements.size() << " configuraciones iniciales válidas." << endl; // DEBUG

    if (initial_queen_placements.empty()) {
        cerr << "No se encontraron soluciones iniciales válidas de reinas para N=" << N << ". Asegúrate de que las reglas sean posibles para este N." << endl; // DEBUG
        return 1;
    }

    // Abrir archivo de salida
    ofstream out_file("boards" + to_string(N) + ".js");
    if (!out_file) {
        cerr << "Error al crear archivo de salida" << endl;
        return 1;
    }
    out_file << "export const boards" << N << " = {\n";

    // Procesar cada solución inicial
    for (const auto& initial_placement : initial_queen_placements) {
        if (board_id >= 5000) {
            cout << "  [DEBUG] Deteniendo bucle principal: Límite de 5000 tableros alcanzado." << endl; // DEBUG
            break; // Límite de tableros
        }

        vector<vector<int>> current_board;
        generate_regions(initial_placement, current_board);
        cout << "  [DEBUG] Regiones generadas para una configuración inicial." << endl; // DEBUG

        // Generar todas las simetrías de este tablero para añadir a la lista de candidatos
        vector<vector<vector<int>>> symmetric_boards;
        symmetric_boards.push_back(current_board); // La original
        
        // Rotaciones (90, 180, 270) y sus volteos. La rotación 0 ya se añadió.
        vector<vector<int>> board_rotated = current_board;
        for(int i = 0; i < 3; ++i) { // 3 rotaciones (90, 180, 270)
            board_rotated = rotate_board(board_rotated);
            symmetric_boards.push_back(board_rotated);
            symmetric_boards.push_back(flip_board(board_rotated));
        }
        // También el volteo horizontal de la original (si no se cubrió ya)
        symmetric_boards.push_back(flip_board(current_board));
        cout << "  [DEBUG] Generadas " << symmetric_boards.size() << " simetrías para el tablero actual." << endl; // DEBUG


        // Guardar los tableros (se encarga de la unicidad y la verificación de solución única)
        save_boards(symmetric_boards, out_file);
    }

    out_file << "\n};" << endl;
    out_file.close();

    cout << "Proceso completado. Generados " << board_id << " tableros válidos." << endl;
    cout << "Archivo guardado en: boards" << N << ".js" << endl;

    return 0;
}