#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <map>
#include <fstream>
#include <random>
#include <filesystem>
#include <chrono>
#include <thread>
#include <mutex>
#include <algorithm>


using namespace std;
using namespace std::chrono;

constexpr int MAX_BOARDS_PER_FILE = 5;
constexpr int MAX_ATTEMPTS = 10000000;
int N = 10;
int unique_id = 1;
mutex file_mutex;

using Board = vector<vector<int>>;

// Movimiento para BFS (regiones)
const vector<pair<int, int>> DIRS = {{1,0}, {-1,0}, {0,1}, {0,-1}};
// Movimiento de reina (ataques)
const vector<pair<int, int>> ATTACKS = {{1,0},{-1,0},{0,1},{0,-1},{1,1},{1,-1},{-1,1},{-1,-1}};

// ------------------ Utilidades ------------------

bool dentro(int x, int y) {
    return 0 <= x && x < N && 0 <= y && y < N;
}

// Chequea si dos celdas son adyacentes (incluso en diagonal)
bool adyacente(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) <= 1 && abs(y1 - y2) <= 1;
}

// ------------------ Generador de regiones ------------------

Board generar_regiones(int N) {
    Board regiones(N, vector<int>(N, 0));
    int actual = 1;
    int celdas_por_region = N * N / N;

    random_device rd;
    mt19937 rng(rd());
    uniform_int_distribution<int> dist(0, N - 1);

    vector<pair<int, int>> direcciones = DIRS;

    while (actual <= N) {
        int x = dist(rng), y = dist(rng);
        if (regiones[x][y] != 0) continue;

        queue<pair<int, int>> q;
        q.push({x, y});
        regiones[x][y] = actual;
        int count = 1;

        while (!q.empty() && count < celdas_por_region) {
            auto [cx, cy] = q.front(); q.pop();

            shuffle(direcciones.begin(), direcciones.end(), rng);
            for (auto [dx, dy] : direcciones) {
                int nx = cx + dx, ny = cy + dy;
                if (dentro(nx, ny) && regiones[nx][ny] == 0) {
                    regiones[nx][ny] = actual;
                    q.push({nx, ny});
                    count++;
                    if (count >= celdas_por_region) break;
                }
            }
        }
        actual++;
    }

    // Rellenar celdas sobrantes
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j)
            if (regiones[i][j] == 0)
                regiones[i][j] = rng() % N + 1;

    return regiones;
}

// ------------------ Solución y verificación ------------------

bool valido(const vector<pair<int, int>>& reinas, int x, int y) {
    for (auto [qx, qy] : reinas) {
        if (qx == x || qy == y) return false;
        if (adyacente(qx, qy, x, y)) return false;
    }
    return true;
}

int contar_soluciones(const Board& regiones, vector<pair<int, int>>& reinas, set<int>& usadas, int fila, int& soluciones) {
    if (fila == N) {
        soluciones++;
        return soluciones;
    }

    for (int col = 0; col < N; ++col) {
        int region = regiones[fila][col];
        if (usadas.count(region)) continue;
        if (!valido(reinas, fila, col)) continue;

        reinas.emplace_back(fila, col);
        usadas.insert(region);

        contar_soluciones(regiones, reinas, usadas, fila + 1, soluciones);
        if (soluciones > 1) return soluciones;

        reinas.pop_back();
        usadas.erase(region);
    }
    return soluciones;
}

bool tiene_solucion_unica(const Board& regiones) {
    vector<pair<int, int>> reinas;
    set<int> usadas;
    int soluciones = 0;
    return contar_soluciones(regiones, reinas, usadas, 0, soluciones) == 1;
}

// ------------------ Exportador ------------------

void exportar_tableros(const vector<Board>& tableros, int N, int archivo_id) {
    lock_guard<mutex> lock(file_mutex);
    string filename = "boards_" + to_string(N) + "_" + to_string(archivo_id) + ".js";
    ofstream out(filename);
    out << "export const boards" << N << " = {\n";

    for (size_t i = 0; i < tableros.size(); ++i) {
        out << "  board_" << (i + 1) << ": [\n";
        for (auto& fila : tableros[i]) {
            out << "    [" << fila[0];
            for (size_t j = 1; j < fila.size(); ++j)
                out << ", " << fila[j];
            out << "],\n";
        }
        out << "  ],\n";
    }
    out << "};\n";
}

// ------------------ Generador paralelo ------------------

void generador_thread(int thread_id) {
    vector<Board> buffer;
    for (int i = 0; i < MAX_ATTEMPTS; ++i) {
        Board regiones = generar_regiones(N);
        if (tiene_solucion_unica(regiones)) {
            buffer.push_back(regiones);
            if (buffer.size() >= MAX_BOARDS_PER_FILE) {
                exportar_tableros(buffer, N, unique_id++);
                buffer.clear();
            }
        }
    }
    if (!buffer.empty()) {
        exportar_tableros(buffer, N, unique_id++);
    }
}

int main() {
    int hilos = 4;
    vector<thread> pool;

    for (int i = 0; i < hilos; ++i)
        pool.emplace_back(generador_thread, i);

    for (auto& t : pool)
        t.join();

    cout << "Generación completada.\n";
    return 0;
}