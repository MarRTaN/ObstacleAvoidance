classdef radarTimer < handle
    
    properties (Access = private)
        objX;
        objXLength;
        objFs;
        radarPath = 'Sample/Radar.mp3';
        radarCenterPath = 'Sample/Tood.mp3';
        distance = 0;
        velocity;
        target;
        counter;
        detectionRange = 5;
        timerPeriod = 1;
        timerDelay = 1;
        defaultPeriod;
        
        radarSound;
        radarFs;
        radarCenterSound;
        radarCenterFs;
        
        userDangerSide = 1.5; %meters left 0.7 right 0.7
        maxNote = 32;
    end
    
    properties
        data = [0 1000 0];
    end
    
    methods
        function obj = setup(obj)
            [X,Fs]= audioread('Sample/Note-C.mp3');
            
            obj.objX = zeros(50000,2,obj.maxNote);
            obj.objXLength = zeros(obj.maxNote);
            
            count = 0;
            for round = 1:obj.maxNote
                
                y1 = pitchShift(X(:,1),1024,32,count);
                y2 = pitchShift(X(:,2),1024,32,count);

                leny1 = length(y1);
                leny2 = length(y2);
                
                obj.objXLength(round) = leny1;
                
                obj.objX(1:leny1,1,round) = y1;
                obj.objX(1:leny2,2,round) = y2;
                
                count = count + (12/obj.maxNote);
                clc
                percent = floor(round*100/obj.maxNote);
                fprintf ('processing %.0f %% \r', percent);
            end
            
            obj.objFs = Fs;
            obj.counter = timer('ExecutionMode','fixedRate','Period',obj.timerPeriod + obj.timerDelay,'TimerFcn',@(a,b)obj.runCounter());
            obj.radarSetup();
        end
        function obj = startTimer(obj)
            start(obj.counter);
        end
        function obj = stopTimer(obj)
            stop(obj.counter);
        end
        function obj = runCounter(obj)
            
            % radar sound
            obj.playRadarSound();
            
            rows = length(obj.data(:,1));
            r = 1;
            
            while r <= rows
                angleAzimuth = obj.data(r,1);
                angleElevation = 0;
                radius = obj.data(r,2);
                siz = obj.data(r,3);
                freq = 1+siz;
                mul = freq;
                if freq > 1
                    mul = 1;
                end
               
                if radius <= obj.detectionRange
                    
                    count = (angleAzimuth + 90) * obj.maxNote / 180;
                    if count - floor(count) >= 0.5
                        count = ceil(count);
                    else
                        count = floor(count);
                    end
                    
                    if count < 1
                        count = 1;
                    elseif count > obj.maxNote
                        count = obj.maxNote;
                    end
                    
                    lenX = obj.objXLength(count);
                    newX = obj.objX(1:lenX,:,count);
                    
                    output = genDirectionSound(newX, obj.objFs, radius, angleAzimuth, angleElevation);
                    diffDis = (obj.detectionRange - radius);
                    volume = diffDis * diffDis; % the futher distance, the less volume
                    obj.playSound(angleAzimuth, output(1:floor(length(output(:,1))*mul),:) * volume, obj.objFs * freq);
                end
                
                r = r+1;
                
            end
        end
        function obj = playSound(obj, angle, output, Fs)
            len = length(output(:,1));
            delay = obj.timerPeriod * ((angle + 90) / 180); % sec
            sampleDelay = floor(Fs * delay);
            newOutput = zeros(len + sampleDelay,2);
            
            for idx = sampleDelay+1:length(newOutput(:,1))
                newOutput(idx,:) = output(idx-sampleDelay,:);
            end
            
            sound(newOutput * 0.8,Fs);
        end
        function obj = radarSetup(obj)
            
            [X,Fs]= audioread(obj.radarPath);
            
            angleAzimuth = -90;                     
            angleElevation = 0;

            outputs = zeros(1,2);

            divid = 30;

            for idx = 1:(divid)

                xlen = length(X);

                ds = ceil(xlen / divid);
                subdim = zeros(ds, 2);
                for i = 1:ds
                    xidx = ((idx - 1) * ds) + i;
                    if(xidx > xlen) 
                        break;
                    end
                    subdim(i,:) = X(xidx,:);
                end
                
                radius = obj.detectionRange;
                output = genDirectionSound(subdim, Fs, radius, angleAzimuth, angleElevation);

                if length(outputs) < 10
                    outputs = output;
                else
                    % cross-fade over last 200 elements
                    n = 2000;
                    W = linspace(1,0,n)';                                    %'

                    outputs(end-n+1:end,1) = outputs(end-n+1:end,1).*W;
                    outputs(end-n+1:end,2) = outputs(end-n+1:end,2).*W;

                    output(1:n,1) = output(1:n,1).*(1-W);
                    output(1:n,2) = output(1:n,2).*(1-W);

                    newOutputs = zeros(size(outputs,1) + size(output,1) - n, 2);

                    newOutputs(1:size(outputs(:,1),1),1) = outputs(:,1);
                    newOutputs(1:size(outputs(:,1),1),2) = outputs(:,2);

                    newOutputs(size(outputs(:,1),1)-n+1:end,1) = newOutputs(size(outputs(:,1),1)-n+1:end,1) + output(:,1);
                    newOutputs(size(outputs(:,1),1)-n+1:end,2) = newOutputs(size(outputs(:,1),1)-n+1:end,2) + output(:,2);

                    outputs = newOutputs;
                end

                angleAzimuth = angleAzimuth + (180 / divid);
            end
            
            obj.radarSound = outputs;
            obj.radarFs = Fs;
            
            % center radar output
            [Y,Fsy] = audioread(obj.radarCenterPath);
            obj.radarCenterSound = genDirectionSound(Y, Fsy, obj.detectionRange, 0, 0);
            obj.radarCenterFs = Fsy;
            
        end
        function obj = playRadarSound(obj)
            sound(obj.radarSound * 1,obj.radarFs);
%             obj.playSound(0, obj.radarCenterSound, obj.radarCenterFs);
        end
        function obj = finish(obj)
            [X,Fs]= audioread('Sample/Correct.mp3');
            sound(X*0.5,Fs);
            obj.stopTimer();
        end
    end
    
end

