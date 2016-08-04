INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (167813348, 61003, 203598750, 443);
INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (167900212, 56473, 203578134, 443);
INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (2887123978, 51905, 176760776, 3268);
INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (167886306, 59994, 203598750, 443);
INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (2887123978, 51894, 176794212, 3268);
INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES (203610520, 46732, 203598668, 389);





--  python helper for making test data from lines like "10.0.160.228, 61003, 12.34.171.158, 443"
def encode(line):
  a = line.split(", ")
  srcip = convert(*(a[0].split(".")))
  srcport = int(a[1])
  dstip = convert(*(a[2].split(".")))
  dstport = int(a[3])
  return "INSERT INTO Syslog (SourceIP, SourcePort, DestinationIP, DestinationPort) VALUES ({0}, {1}, {2}, {3});".format(srcip, srcport, dstip, dstport)

def convert(a, b, c, d):
  return (int(a)<<24) + (int(b)<<16) + (int(c)<<8) + int(d)


-- testing column joins syntax
CREATE TABLE blah
(counter INT UNSIGNED NOT NULL AUTO_INCREMENT
, colA INT NOT NULL
, colB INT NOT NULL
, CONSTRAINT PKblah PRIMARY KEY (counter)
);

INSERT INTO blah (colA, colB) VALUES (1, 10);
INSERT INTO blah (colA, colB) VALUES (1, 11);
INSERT INTO blah (colA, colB) VALUES (1, 12);
INSERT INTO blah (colA, colB) VALUES (2, 12);
INSERT INTO blah (colA, colB) VALUES (3, 12);
INSERT INTO blah (colA, colB) VALUES (5, 5);
INSERT INTO blah (colA, colB) VALUES (5, 1);
INSERT INTO blah (colA, colB) VALUES (12, 5);
INSERT INTO blah (colA, colB) VALUES (12, 1);

SELECT col, COUNT(*) AS cnt
FROM (
    (SELECT colA AS col
    FROM blah)
    UNION ALL
    (SELECT colB AS col
    FROM blah)
) AS jpResult
GROUP BY col;


SELECT SourceIP DIV 16777216 AS source8
     , (SourceIP MOD 16777216) DIV 65536 AS source16
     , DestinationIP DIV 16777216 AS dest8
     , (DestinationIP MOD 16777216) DIV 65536 AS dest16
     , COUNT(*) AS conns
FROM Syslog
WHERE (SourceIP DIV 16777216) = (DestinationIP DIV 16777216)
GROUP BY source8, source16, dest8, dest16
;


-- connections within the cluster (src/dst8 are same).  2 joins to attach src and dst coordinates
SELECT source8, source16, dest8, dest16, port, conns, src.x, src.y, dst.x, dst.y
FROM
    (SELECT SourceIP DIV 16777216 AS source8
             , (SourceIP - (SourceIP DIV 16777216) * 16777216) DIV 65536 AS source16
             , DestinationIP DIV 16777216 AS dest8
             , (DestinationIP - (DestinationIP DIV 16777216) * 16777216) DIV 65536 AS dest16
             , DestinationPort as port
             , COUNT(*) AS conns
        FROM Syslog
        WHERE (SourceIP DIV 16777216) = (DestinationIP DIV 16777216)
        GROUP BY source8, source16, dest8, dest16, port)
        AS main
    JOIN
        (SELECT parent8, address, x, y
        FROM Nodes16)
        AS src
        ON (source8 = src.parent8 && source16 = src.address)
    JOIN
        (SELECT parent8, address, x, y
        FROM Nodes16)
        AS dst
        ON (dest8 = dst.parent8 && dest16 = dst.address);

-- inbound connections from outside the cluster.  2 joins to attach src and dst coordinates
SELECT source8, -1 AS source16, dest8, dest16, port, conns, src.x, src.y, dst.x, dst.y
FROM
    (SELECT SourceIP DIV 16777216 AS source8
             , DestinationIP DIV 16777216 AS dest8
             , (DestinationIP - (DestinationIP DIV 16777216) * 16777216) DIV 65536 AS dest16
             , DestinationPort as port
             , COUNT(*) AS conns
        FROM Syslog
        WHERE (SourceIP DIV 16777216) != (DestinationIP DIV 16777216)
        GROUP BY source8, dest8, dest16, port)
        AS main
    JOIN
        (SELECT address, x, y
        FROM Nodes8)
        AS src
        ON (source8 = src.address)
    JOIN
        (SELECT parent8, address, x, y
        FROM Nodes16)
        AS dst
        ON (dest8 = dst.parent8 && dest16 = dst.address)
UNION
SELECT source8, source16, dest8, -1 AS dest16, port, conns, src.x, src.y, dst.x, dst.y
FROM
    (SELECT SourceIP DIV 16777216 AS source8
             , (SourceIP - (SourceIP DIV 16777216) * 16777216) DIV 65536 AS source16
             , DestinationIP DIV 16777216 AS dest8
             , DestinationPort as port
             , COUNT(*) AS conns
        FROM Syslog
        WHERE (SourceIP DIV 16777216) != (DestinationIP DIV 16777216)
        GROUP BY source8, source16, dest8, port)
        AS main
    JOIN
        (SELECT parent8, address, x, y
        FROM Nodes16)
        AS src
        ON (source8 = src.parent8 && source16 = src.address)
    JOIN
        (SELECT address, x, y
        FROM Nodes8)
        AS dst
        ON (dest8 = dst.address)

SELECT -1 AS x, y
FROM Nodes8
UNION
SELECT x, -1 AS y
FROM Nodes8;


