import sys
import os
import json
import common
import dbaccess
import random

garbler = list(range(256))
random.shuffle(garbler)

permitted = {} # nodes pre-approved
maxPermit = 1000 # max number of nodes


def permit(address):
    if permitted.has_key(address):
        return True
    if len(permitted) < maxPermit:
        permitted[address] = True
        return True
    return False


def garble(address):
    ip8 = (address & 0xff000000) >> 24
    ip16 = (address & 0x00ff0000) >> 16
    ip24 = (address & 0x0000ff00) >> 8
    ip32 = (address & 0x000000ff)
    ip8 = garbler[ip8]
    ip16 = garbler[ip16]
    ip24 = garbler[ip24]
    ip32 = garbler[ip32]
    garbledAddress = (ip8 << 24) + (ip16 << 16) + (ip24 << 8) + (ip32)
    return garbledAddress


def validate_file(path):
    """
    Check whether a given path is a file.
    Args:
        path: The path to verify is a file

    Returns:
        True or False
    """
    if os.path.isfile(path):
        return True
    else:
        print("File not found:", path)
        return False


def instructions():
    print("""
This program imports a syslog dump into the MySQL database.
It extracts IP addresses and ports and discards other data. Only TCP traffic data is used.

Usage:
    python {0} <input-file>
    """.format(sys.argv[0]))


def translate(line, line_num, dictionary):
    """
    Converts a given syslog line into a dictionary of (ip, port, ip, port)
    Args:
        line: The syslog line to parse
        line_num: The line number, for error printouts
        dictionary: The dictionary to write key/values pairs into

    Returns:
        0 on success and non-zero on error.
        -1 => ignoring a message that isn't network "TRAFFIC"
        -2 => error in parsing the line. It was too short for some reason
        -3 => The protocol wasn't TCP and was ignored.
    """
    data = json.loads(line)['message']
    # TODO: this assumes the data will not have any commas embedded in strings
    split_data = data.split(',')

    if split_data[3] != "TRAFFIC":
        print("Line {0}: Ignoring non-TRAFFIC entry (was {1})".format(line_num, split_data[3]))
        return 1
    if len(split_data) < 29:
        print("error parsing line {0}: {1}".format(line_num, line))
        return 2
    # 29 is protocol: tcp, udp, ...
    # TODO: don't ignore everything but TCP
    if split_data[29] != 'tcp':
        # printing this is very noisy and slow
        # print("Line {0}: Ignoring non-TCP entry (was {1})".format(lineNum, split_data[29]))
        return 3

    # srcIP, srcPort, dstIP, dstPort
    dictionary['SourceIP'] = common.IPtoInt(*(split_data[7].split(".")))
    dictionary['SourcePort'] = split_data[24]
    dictionary['DestinationIP'] = common.IPtoInt(*(split_data[8].split(".")))
    dictionary['DestinationPort'] = split_data[25]
    return 0


def import_file(path_in):
    """
    Takes a file path and attempts to import it into the database. Specifically into the samapper.Syslog table
    Args:
        path_in: The path to a log file to read/import

    Returns:
        None
    """
    with open(path_in) as fin:
        line_num = -1
        lines_inserted = 0
        counter = 0
        row = {"SourceIP":"", "SourcePort":"", "DestinationIP":"", "DestinationPort":""}
        rows = [row.copy() for i in range(1000)]
        for line in fin:
            line_num += 1

            if translate(line, line_num, rows[counter]) != 0:
                continue
            rows[counter]["SourceIP"] = garble(int(rows[counter]["SourceIP"]))
            rows[counter]["DestinationIP"] = garble(int(rows[counter]["DestinationIP"]))

            if not permit(rows[counter]["SourceIP"]) or not rows[counter]["SourceIP"]:
                continue

            counter += 1

            # Perform the actual insertion in batches of 1000
            if counter == 1000:
                insert_data(rows, counter)
                lines_inserted += counter
                counter = 0
        if counter != 0:
            insert_data(rows, counter)
            lines_inserted += counter
        print("Done. {0} lines processed, {1} rows inserted".format(line_num, lines_inserted))


def insert_data(rows, count):
    """
    Attempt to insert the first 'count' items in 'rows' into the database table `samapper`.`Syslog`.
    Exits script on critical failure.
    Args:
        rows: The iterable containing dictionaries to insert
            (dictionaries must all have the same keys, matching column names)
        count: The number of items from rows to insert

    Returns:
        None
    """
    try:
        truncated_rows = rows[:count]
        # >>> values = [{"name": "foo", "email": "foo@example.com"}, {"name": "bar", "email": "bar@example.com"}]
        # >>> db.multiple_insert('person', values=values, _test=True)
        common.db.multiple_insert('Syslog', values=truncated_rows)
    except Exception as e:
        # see http://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html for codes
        if e[0] == 1049: # Unknown database 'samapper'
            dbaccess.create_database()
            insert_data(rows, count)
        elif e[0] == 1045: # Access Denied for '%s'@'%s' (using password: (YES|NO))
            print(e[1])
            print("Check your username / password? (dbconfig_local.py)")
            sys.exit(1)
        else:
            print("Critical failure.")
            print(e.message)
            sys.exit(2)


def main(argv):
    if len(argv) != 2:
        instructions()
        return

    if validate_file(argv[1]):
        import_file(argv[1])
    else:
        instructions()
        return


# If running as a script, begin by executing main.
if __name__ == "__main__":
    main(sys.argv)
