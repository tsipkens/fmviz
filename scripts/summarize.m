
% A script to condense fm-all.csv into fm.csv by averaging repeat samples.

clear;
close all;
clc;

tbl = readtable('../data/fm-all.csv');

caseCodes = unique(tbl.CaseCode, 'stable');

% Get col. ids to average over.
colidx = contains(fields(tbl), {'Filt'});
colidx = or(colidx, contains(fields(tbl), {'PressureDrop'}));
colidx = or(colidx, contains(fields(tbl), {'Weight'}));

% Get other notable columns.
colq = contains(fields(tbl), {'Quality'});
colp = contains(fields(tbl), {'PressureDrop'});
colf9 = contains(fields(tbl), {'Filt9'});
colf = contains(fields(tbl), {'Filt'});

% Loop and sum.
tblo = tbl(1,:);
for ii=1:length(caseCodes)
    
    idx = strcmp(caseCodes{ii}, tbl.CaseCode);  % find CaseCode in tbl
    
    tblo(ii,:) = tbl(find(idx, 1, 'first'),:);  % copy first instance into output
    
    if sum(idx) > 1  % if duplicate entries, average colidx columns
        tblo(ii, colidx) = array2table(round(mean(table2array(tbl(idx, colidx))), 4));
        
        a = -1000 .* log(table2array(tblo(ii, colf9))) ...
            ./ table2array(tblo(ii, colp));
        if ~isinf(a)
            tblo(ii, colq) = array2table(a);
        end
    end
    
end


if 1
    writetable(tblo, '../data/fm.csv');
end

disp('Complete.');


%%
%{
% Verification loop.
tbla = readtable('../data/fm-old.csv');
ps = [];
fl = [];
for jj=82
    jb = find(strcmp(tbla.CaseCode{jj}, tblo.CaseCode), 1, 'first');
    
    ps(ii,:) = [table2array(tbla(jj, colp)), table2array(tblo(jb, colp))];
    
    
    fa = table2array(tbla(jj, colf));
    fb = table2array(tblo(jb, colf));
    fl(jj,:) = nansum(fa - fb) > 0.01;
    
    %{
    figure(1);
    plot(table2array(tbla(jj, colf)));
    hold on;
    plot(table2array(tblo(jb, colf)), 'k--');
    hold off;
    title(tbla.CaseCode{jj});
    
    pause(0.4);
    %}
end
fc = find(fl);
%}

