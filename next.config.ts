import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Server',
            value: 'Lotus-Domino/8.5, Netscape-Enterprise/6.0, CERN-httpd/3.0, Apache-Coyote/1.1, Yaws/2.1.0, Hunchentoot/1.3.0, AOLserver/4.5.1, Yesod, CouchDB/3.1.1',
          },
          {
            key: 'X-Powered-By',
            value: 'Zope, PHP/5.2.17, HHVM/3.30.0, Hack, ASP.NET, Phusion Passenger, JSF/1.1, Zend Framework, Mojolicious, Kemal, ColdFusion, Rocket/0.5.0, Lapis/1.8.0',
          },
          {
            key: 'X-Varnish',
            value: '987654321',
          },
          {
            key: 'Via',
            value: '1.1 varnish, 1.1 squid',
          },
          {
            key: 'X-Pingback',
            value: '/xmlrpc.php',
          },
          {
            key: 'X-Engine',
            value: 'HHVM/3.30.0',
          },
          {
            key: 'X-WebLogic-Request-ClusterInfo',
            value: 'true',
          },
          {
            key: 'X-WebLogic-Server-Name',
            value: 'AdminServer',
          },
          {
            key: 'X-AspNet-Version',
            value: '2.0.50727',
          },
          {
            key: 'X-AspNetMvc-Version',
            value: '1.0',
          },
          {
            key: 'X-Runtime',
            value: '0.052026',
          },
          {
            key: 'X-Play-Version',
            value: '2.8.8',
          },
          {
            key: 'Set-Cookie',
            value: 'JSESSIONID=0000abcde12345fghij67890klmno; Path=/; HttpOnly; Secure',
          },
          {
            key: 'Set-Cookie',
            value: 'PHPSESSID=php-session-mock-9988776655; Path=/; HttpOnly',
          },
          {
            key: 'Set-Cookie',
            value: '_session_id=rails-session-mock-1122334455; Path=/; HttpOnly',
          },
          {
            key: 'Set-Cookie',
            value: 'ASP.NET_SessionId=asp-session-mock-5566778899; Path=/; HttpOnly',
          },
          {
            key: 'Set-Cookie',
            value: 'CFID=999999; Path=/; HttpOnly',
          },
          {
            key: 'Set-Cookie',
            value: 'CFTOKEN=88888888; Path=/; HttpOnly',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
