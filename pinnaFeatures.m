function [ output ] = pinnaFeatures( theta, phi )
    p = [0.5, -1, 0.5, -0.25, 0.25];
    a = [1, 5, 5, 5, 5];
    b = [2, 4, 7, 11, 13];
    d = [0.85, 0.35, 0.35, 0.35, 0.35];
    angle = pi / 2;
    output = 0;
    
    for idx = 1:5
        result = p(idx) * ((a(idx) * cos(theta / 2) * sin(d(idx) * (angle - phi))) + b(idx));
        output = output + result;
    end

end

