function [ a ] = angleIncident( theta )
    % a function :: 
    % a(theta) = (1+amin/2) + (1-amin/2)*cos(theta/tmin * 180);

    amin = 0.1;
    tmin = degtorad(150);
    a = (1 + (amin / 2)) + ((1 - (amin / 2)) * cos(theta * pi / tmin));

end

