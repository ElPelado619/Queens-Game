#include <iostream>
#include <vector>
#include <set>
#include <random>
#include <thread>
#include <mutex>
#include <fstream>
#include <algorithm>

using namespace std;

int N, board_id = 0;
mutex mtx;

bool is_adjacent(int r1, int c1, int r2, int c2) {
    return abs(r1 - r2) <= 1 && abs(c1 - c2) <= 1;
}

bool is_valid(const vector<int>& q) {
    for (int i = 0; i < N; ++i)
        for (int j = i + 1; j < N; ++j)
            if (is_adjacent(i, q[i], j, q[j])) return false;
    return true;
}

vector<vector<int>> generate_solutions() {
    vector<vector<int>> res;
    vector<int> q(N); iota(q.begin(), q.end(), 0);
    do if (is_valid(q)) res.push_back(q);
    while (next_permutation(q.begin(), q.end()));
    return res;
}

bool fill_board(const vector<int>& q, vector<vector<int>>& board, int max_tries = 100) {
    random_device rd; mt19937 g(rd());
    vector<pair<int, int>> seeds(N);
    for (int i = 0; i < N; ++i) seeds[i] = {i, q[i]};

    while (max_tries--) {
        shuffle(seeds.begin(), seeds.end(), g);
        board.assign(N, vector<int>(N, 0));
        vector<vector<bool>> used(N, vector<bool>(N, false));
        for (int i = 0; i < N; ++i) {
            board[seeds[i].first][seeds[i].second] = i + 1;
            used[seeds[i].first][seeds[i].second] = true;
        }

        bool changed;
        do {
            changed = false;
            for (int r = 0; r < N; ++r)
                for (int c = 0; c < N; ++c)
                    if (board[r][c] == 0)
                        for (int dr = -1; dr <= 1; ++dr)
                            for (int dc = -1; dc <= 1; ++dc) {
                                int nr = r + dr, nc = c + dc;
                                if (nr >= 0 && nc >= 0 && nr < N && nc < N && board[nr][nc]) {
                                    board[r][c] = board[nr][nc];
                                    changed = true;
                                    goto next_cell;
                                }
                            }
                    next_cell:;
        } while (changed);

        if (all_of(board.begin(), board.end(), [](auto& row) {
            return all_of(row.begin(), row.end(), [](int v) { return v > 0; });
        })) return true;
    }
    return false;
}

vector<vector<int>> rotate(const vector<vector<int>>& b) {
    vector<vector<int>> r(N, vector<int>(N));
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j)
            r[j][N - 1 - i] = b[i][j];
    return r;
}

vector<vector<int>> flip(const vector<vector<int>>& b) {
    vector<vector<int>> r = b;
    for (auto& row : r) reverse(row.begin(), row.end());
    return r;
}

void save(const vector<vector<int>>& b) {
    lock_guard<mutex> lock(mtx);
    ofstream f("boards" + to_string(N) + ".js", ios::app);
    if (board_id == 0)
        f << "export const boards" << N << " = {\n";
    f << "  \"board_" << ++board_id << "\": {\n    \"board\": [\n";
    for (int i = 0; i < N; ++i) {
        f << "      [";
        for (int j = 0; j < N; ++j)
            f << b[i][j] << (j < N - 1 ? "," : "");
        f << "]" << (i < N - 1 ? "," : "") << "\n";
    }
    f << "    ]\n  },\n";
}

void process(const vector<vector<int>>& sols, int start, int end) {
    for (int i = start; i < end; ++i) {
        set<vector<vector<int>>> gen;
        int count = 0, tries = 0;
        vector<vector<int>> board;
        while (count < 4 && tries++ < 100) {
            if (fill_board(sols[i], board) && gen.insert(board).second) {
                save(board); count++;
            }
        }
        for (auto& v : {rotate(board), rotate(rotate(board)), rotate(rotate(rotate(board))), flip(board)})
            if (count < 4 && gen.insert(v).second) {
                save(v); count++;
            }
    }
}

int main() {
    cout << "Board size N: ";
    cin >> N;
    auto sols = generate_solutions();
    cout << sols.size() << " valid placements.\n";

    int T = thread::hardware_concurrency();
    vector<thread> threads;
    int per = sols.size() / T;

    for (int i = 0; i < T; ++i) {
        int start = i * per;
        int end = (i == T - 1) ? sols.size() : start + per;
        threads.emplace_back(process, cref(sols), start, end);
    }

    for (auto& t : threads) t.join();

    fstream f("boards" + to_string(N) + ".js", ios::in | ios::out);
    f.seekp(-2, ios::end); f << "\n};\n";
    cout << "Saved to boards" << N << ".js\n";
    return 0;
}
