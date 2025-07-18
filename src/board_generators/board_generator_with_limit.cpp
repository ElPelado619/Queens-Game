#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <random>
#include <thread>
#include <mutex>
#include <fstream>
#include <map>
#include <unordered_set>
#include <numeric>

using namespace std;

const int MAX_BOARDS = 5000;
int N, board_id = 0;
mutex mtx;

// Funcion para verificar posiciones validas de reinas
bool is_valid(const vector<pair<int, int>>& queens) {
    for (size_t i = 0; i < queens.size(); ++i) {
        for (size_t j = i + 1; j < queens.size(); ++j) {
            int dx = abs(queens[i].first - queens[j].first);
            int dy = abs(queens[i].second - queens[j].second);
            if (dx <= 1 && dy <= 1) return false;
        }
    }
    return true;
}

// Generar todas las soluciones validas
vector<vector<pair<int, int>>> generate_solutions() {
    vector<vector<pair<int, int>>> solutions;
    vector<int> cols(N);
    iota(cols.begin(), cols.end(), 0);

    do {
        vector<pair<int, int>> queens;
        bool valid = true;
        
        for (int row = 0; row < N; ++row) {
            queens.emplace_back(row, cols[row]);
            if (!is_valid(queens)) {
                valid = false;
                break;
            }
        }
        
        if (valid) solutions.push_back(queens);
    } while (next_permutation(cols.begin(), cols.end()));

    return solutions;
}

// Algoritmo mejorado para rellenar regiones
void fill_regions(vector<vector<int>>& board, const vector<pair<int, int>>& queens) {
    // Inicializar el tablero
    board.assign(N, vector<int>(N, 0));
    random_device rd;
    mt19937 g(rd());

    // Asignar cada reina a su propia region
    for (int i = 0; i < N; ++i) {
        board[queens[i].first][queens[i].second] = i + 1;
    }

    // Direcciones para expansion (8 vecinos)
    const vector<pair<int, int>> directions = {
        {-1,-1}, {-1,0}, {-1,1},
        {0,-1},          {0,1},
        {1,-1},  {1,0},  {1,1}
    };

    // BFS para cada region
    vector<queue<pair<int, int>>> region_queues(N);
    for (int i = 0; i < N; ++i) {
        region_queues[i].push(queens[i]);
    }

    // Contador de celdas asignadas por region
    vector<int> region_sizes(N, 1);
    int total_assigned = N;

    while (total_assigned < N * N) {
        // Procesar cada region
        for (int region = 0; region < N; ++region) {
            if (region_queues[region].empty()) continue;

            // Limitar el crecimiento por iteracion
            int growth_limit = max(1, (N * N / N) / 2);
            int grown = 0;

            while (!region_queues[region].empty() && grown < growth_limit) {
                auto current = region_queues[region].front();
                region_queues[region].pop();

                // Explorar vecinos
                for (const auto& dir : directions) {
                    int ni = current.first + dir.first;
                    int nj = current.second + dir.second;

                    if (ni >= 0 && ni < N && nj >= 0 && nj < N && board[ni][nj] == 0) {
                        board[ni][nj] = region + 1;
                        region_queues[region].emplace(ni, nj);
                        region_sizes[region]++;
                        grown++;
                        total_assigned++;

                        if (total_assigned >= N * N) break;
                    }
                }
                if (total_assigned >= N * N) break;
            }
        }
    }
}

// Rotar el tablero 90 grados
vector<vector<int>> rotate(const vector<vector<int>>& b) {
    vector<vector<int>> r(N, vector<int>(N));
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            r[j][N - 1 - i] = b[i][j];
        }
    }
    return r;
}

// Voltear el tablero horizontalmente
vector<vector<int>> flip(const vector<vector<int>>& b) {
    vector<vector<int>> r = b;
    for (auto& row : r) {
        reverse(row.begin(), row.end());
    }
    return r;
}

// Guardar los tableros en formato JavaScript
void save_boards(const vector<vector<vector<int>>>& boards) {
    lock_guard<mutex> lock(mtx);
    ofstream f("boards" + to_string(N) + ".js", ios::app);
    
    if (board_id == 0) {
        f << "export const boards" << N << " = {\n";
    }
    
    for (const auto& board : boards) {
        f << "  \"board_" << ++board_id << "\": [\n";
        for (int i = 0; i < N; ++i) {
            f << "      [";
            for (int j = 0; j < N; ++j) {
                f << board[i][j];
                if (j < N - 1) f << ",";
            }
            f << "]" << (i < N - 1 ? "," : "") << "\n";
        }
        f << "    ]" << (board_id < MAX_BOARDS ? "," : "") << "\n";
        
        if (board_id >= MAX_BOARDS) break;
    }
}

// Procesar soluciones en paralelo
void process_solutions(const vector<vector<pair<int, int>>>& solutions, int start, int end) {
    vector<vector<vector<int>>> local_boards;
    
    for (int i = start; i < end && board_id < MAX_BOARDS; ++i) {
        vector<vector<int>> board;
        fill_regions(board, solutions[i]);
        local_boards.push_back(board);
        
        // Generar variaciones
        auto rotated = rotate(board);
        local_boards.push_back(rotated);
        
        auto flipped = flip(board);
        local_boards.push_back(flipped);
        
        auto rot_flipped = flip(rotated);
        local_boards.push_back(rot_flipped);

        // Guardar en bloques para reducir contencion
        if (local_boards.size() >= 20 || i == end - 1) {
            save_boards(local_boards);
            local_boards.clear();
        }
    }
}

int main() {
    cout << "Board size N: ";
    cin >> N;
    
    auto solutions = generate_solutions();
    cout << solutions.size() << " valid queen placements found.\n";
    
    int num_threads = thread::hardware_concurrency();
    vector<thread> threads;
    int chunk_size = solutions.size() / num_threads;
    
    // Limpiar archivo de salida
    ofstream("boards" + to_string(N) + ".js").close();
    
    for (int i = 0; i < num_threads && board_id < MAX_BOARDS; ++i) {
        int start = i * chunk_size;
        int end = (i == num_threads - 1) ? solutions.size() : start + chunk_size;
        threads.emplace_back(process_solutions, cref(solutions), start, end);
    }
    
    for (auto& t : threads) t.join();
    
    // Cerrar correctamente el archivo JS
    if (board_id > 0) {
        ofstream f("boards" + to_string(N) + ".js", ios::app);
        f << "};\n";
    }
    
    cout << "Generated " << min(board_id, MAX_BOARDS) << " boards.\n";
    return 0;
}