import com.fastcgi.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

class Main {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    //private static final PrintStream CONSOLE = new PrintStream(new FileOutputStream(FileDescriptor.err), true);
    private static final List<Double> ACCEPTABLE_X = Arrays.asList(-2d, -1.5d, -1d, -0.5d, 0d, 0.5d, 1d, 1.5d, 2d);
    private static final List<Double> ACCEPTABLE_R = Arrays.asList(1d, 1.5d, 2d, 2.5d, 3d);
    private static final double MIN_Y = -3d;
    private static final double MAX_Y = 3d;
    private static final String HTTP_RESPONSE = """
            HTTP/1.1 200 OK
            Content-Type: application/json
            Content-Length: %d
            
            %s
            """;
    private static final String HTTP_ERROR = """
            HTTP/1.1 400 Bad Request
            Content-Type: application/json
            Content-Length: %d
            
            %s
            """;
    private static final String RESULT_JSON = """
            {
                "x": %f,
                "y": %.16f,
                "r": %f,
                "time": "%s",
                "executionTime": %d,
                "result": "%s"
            }
            """;
    private static final String ERROR_JSON = """
            {
                "reason": "%s"
            }
            """;

    public static void main(String[] args) {
        FCGIInterface intf = new FCGIInterface();
        while (intf.FCGIaccept() >= 0) {
            try {
               long startTime = System.nanoTime();
                String method = System.getProperty("REQUEST_METHOD");
                String paramsStr;
                if ("GET".equalsIgnoreCase(method)) {
                    paramsStr = System.getProperty("QUERY_STRING", "");
                } else {
                    throw new Exception("Получен неподдерживаемый метод: " + method);
                }
                paramsStr = URLDecoder.decode(paramsStr, StandardCharsets.UTF_8);
                if (paramsStr.isEmpty()) {
                    throw new Exception("Параметры не получены");
                }
                double[] params = parseParams(paramsStr);
                if (validateParams(params)) {
                    String result = calculate(params) ? "попал" : "не попал";
                    long executionTime = (System.nanoTime() - startTime)/1000;
                    String json = String.format(Locale.US,RESULT_JSON,
                            params[0], params[1], params[2],
                            LocalDateTime.now().format(TIME_FORMATTER),
                            executionTime, result);
                    String response = String.format(HTTP_RESPONSE,
                            json.getBytes(StandardCharsets.UTF_8).length, json);
                    System.out.println(response);
                } else throw new Exception("Параметры не валидны" + method);
            } catch (Exception e) {
                String json = String.format(ERROR_JSON,
                        e.getMessage()
                );
                String response = String.format(HTTP_ERROR,
                        json.getBytes(StandardCharsets.UTF_8).length,
                        json
                );
                System.out.println(response);
            }
        }
    }

    public static boolean calculate(double[] params) {
        var x = params[0];
        var y = params[1];
        var r = params[2];
        if (x <= 0 && y >= 0 && x * x + y * y <= r * r) return true;
        if (x <= 0 && x >= -r && y <= 0 && 2*y >= -r) return true;
        if (x >= 0 && y >= 0 && 2 * y <= r - x) return true;
        return false;
    }

    public static double[] parseParams(String str) throws Exception {
        double[] result = new double[3];
        String[] params = str.split("&");
        if (params.length != 3) {
            throw new Exception("Ожидается ровно 3 параметра (x, y, r)");
        }
        int i = 0;
        String[] args = {"x", "y", "r"};
        for (String elem : params) {
            String[] part = elem.split("=");
                if (part.length != 2) {
                    throw new Exception("не удалось считать значение параметра");
                }
                if (!part[0].equals(args[i])){
                    throw new Exception("полученный параметр "+part[0]+"это не x y r");
                }
                    result[i] = Double.parseDouble(part[1]);
                i++;

        }
        return result;
    }

    public static boolean validateParams(double[] params) {
        double x = params[0];
        double y = params[1];
        double r = params[2];
        if (!ACCEPTABLE_X.contains(x)) return false;
        if (y < MIN_Y || y > MAX_Y) return false;
        if (!ACCEPTABLE_R.contains(r)) return false;
        return true;
    }
}