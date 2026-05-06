#include "httplib.h"
#include "json.hpp"
#include <iostream>

int main() {
    httplib::Server svr;
    nlohmann::json j;
    std::cout << "Headers OK" << std::endl;
    return 0;
}
