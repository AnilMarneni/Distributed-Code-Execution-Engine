#include <iostream>
#include <string>
#include <memory>
#include "../include/httplib.h"
#include "../include/json.hpp"

using json = nlohmann::json;

int main() {
    httplib::Server svr;
    
    std::cout << "Simple Worker starting..." << std::endl;

    svr.Post("/execute", [](const httplib::Request& req, httplib::Response& res) {
        std::cout << "Received execute request" << std::endl;
        res.set_content("{\"status\":\"success\"}", "application/json");
    });

    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("{\"status\":\"UP\"}", "application/json");
    });

    if (!svr.listen("0.0.0.0", 4000)) {
        return 1;
    }

    return 0;
}
