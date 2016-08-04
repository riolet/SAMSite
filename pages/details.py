import json
import web
import dbaccess
import common


class Details:
    def GET(self):
        web.header("Content-Type", "application/json")

        get_data = web.input()

        ips = [
            int(get_data.get('ip8', -1)),
            int(get_data.get('ip16', -1)),
            int(get_data.get('ip24', -1)),
            int(get_data.get('ip32', -1))
            ]

        details = dbaccess.getDetails(*ips)

        conn_in = {}
        for connection in details['conn_in']:
            ip = common.IPtoString(connection.pop("ip"))
            if ip in conn_in:
                # add a port
                conn_in[ip] += [connection]
            else:
                # add a new entry
                conn_in[ip] = [connection]
        # convert to list of tuples to make it sortable
        conn_in = conn_in.items()
        conn_in.sort(key=key_by_link_sum, reverse=True)
        details['conn_in'] = conn_in

        conn_out = {}
        for connection in details['conn_out']:
            ip = common.IPtoString(connection.pop("ip"))
            if ip in conn_out:
                # add a port
                conn_out[ip] += [connection]
            else:
                # add a new entry
                conn_out[ip] = [connection]
        # convert to list of tuples to make it sortable
        conn_out = conn_out.items()
        conn_out.sort(key=key_by_link_sum, reverse=True)
        details['conn_out'] = conn_out

        return json.dumps(details)


def key_by_link_sum(connection):
    tally = 0
    for con in connection[1]:
        tally += con.links
    return tally
