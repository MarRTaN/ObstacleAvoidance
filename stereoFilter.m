function [ filter ] = stereoFilter(f, r, t, e )
    radius = r;
    theta = t;
    thetaE = e;
    
    c = 343;                                % meter per second
    omega = 2*pi*f;
    omega0 = c/radius;
    
    diff = theta - thetaE;
    a = angleIncident(diff);      % angle of incident
    
%     if abs(diff) < (pi / 2)                     % time delay ear 
%         td = -(radius / c) * (diff);
%     else
%         td = (radius / c) * (abs(diff) - (pi / 2));
%     end

%     td = 0.5 * (radius / c) * a;
    
    HSide = exp((omega * 1) * -1i);
    HTop = 1 + ((a * omega * 1i) / (2 * omega0));
    HBot = 1 + (omega * 1i / (2 * omega0));
    filter = (HTop / HBot) * HSide;          % Filter for ear
end

